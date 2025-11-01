(function (global) {
  const PIC2BIM_DOMAIN = "https://pic2bim.co.uk";
  const PIC2BIM_LOGIN_PATH = "/comm_login";
  const PIC2BIM_BUILDING_PATH = "/comm_osm_building_part_nearest";
  const PIC2BIM_TOKEN_BUFFER_MS = 30_000;

  const pic2bimAuthState = { token: null, expiresAt: 0 };

  const getCredentials = () => {
    const credentials = global.pic2bimCredentials;
    if (
      credentials &&
      typeof credentials.username === "string" &&
      credentials.username &&
      typeof credentials.password === "string" &&
      credentials.password
    ) {
      return {
        username: credentials.username,
        password: credentials.password,
      };
    }
    return null;
  };

  const looksLikeTokenString = (value) => {
    if (typeof value !== "string") {
      return false;
    }
    const trimmed = value.trim();
    if (!trimmed) {
      return false;
    }
    if (/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(trimmed)) {
      return true;
    }
    return trimmed.length >= 16;
  };

  const parseTokenFromResponse = (payload) => {
    if (!payload) {
      return null;
    }

    if (typeof payload === "string") {
      return looksLikeTokenString(payload) ? payload.trim() : null;
    }

    const inspectObjectForToken = (object) => {
      if (!object || typeof object !== "object" || Array.isArray(object)) {
        return null;
      }

      const directTokenKeys = [
        "token",
        "accessToken",
        "access_token",
        "bearer",
        "jwt",
        "authorization",
      ];

      for (const key of directTokenKeys) {
        const value = object[key];
        if (typeof value === "string" && value.trim()) {
          return value.trim();
        }
      }

      const nestedTokenKeys = ["data", "result", "payload"];
      for (const key of nestedTokenKeys) {
        const nested = object[key];
        const candidate = parseTokenFromResponse(nested);
        if (candidate) {
          return candidate;
        }
      }

      for (const [key, value] of Object.entries(object)) {
        if (
          typeof value === "string" &&
          /token|bearer|jwt|access/i.test(key) &&
          looksLikeTokenString(value)
        ) {
          return value.trim();
        }
      }

      for (const value of Object.values(object)) {
        const candidate = parseTokenFromResponse(value);
        if (candidate) {
          return candidate;
        }
      }

      return null;
    };

    if (Array.isArray(payload)) {
      for (const item of payload) {
        const candidate = parseTokenFromResponse(item);
        if (candidate) {
          return candidate;
        }
      }
      return null;
    }

    return inspectObjectForToken(payload);
  };

  const parseResponsePayload = (rawBody) => {
    if (typeof rawBody !== "string") {
      return null;
    }
    const trimmed = rawBody.trim();
    if (!trimmed) {
      return null;
    }
    try {
      return JSON.parse(trimmed);
    } catch (error) {
      return trimmed;
    }
  };

  const resolveTokenExpiry = (payload) => {
    const nested = payload && payload.data ? payload.data : payload;
    const expiresField =
      nested &&
      (nested.expiresIn ?? nested.expires_in ?? nested.expires ?? null);
    if (Number.isFinite(expiresField)) {
      const expiresInMs = Number(expiresField) * 1000;
      return Date.now() + expiresInMs;
    }
    return Date.now() + 15 * 60 * 1000;
  };

  const resetAuth = () => {
    pic2bimAuthState.token = null;
    pic2bimAuthState.expiresAt = 0;
  };

  const requestToken = async () => {
    const credentials = getCredentials();
    if (!credentials) {
      throw new Error(
        "Missing pic2bim credentials. Create pic2bim-credentials.local.js.",
      );
    }

    const response = await fetch(`${PIC2BIM_DOMAIN}${PIC2BIM_LOGIN_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      resetAuth();
      throw new Error(
        `Login failed (${response.status}: ${response.statusText}).`,
      );
    }

    const rawBody = await response.text();
    const payload = parseResponsePayload(rawBody);
    const token = parseTokenFromResponse(payload);
    if (!token) {
      resetAuth();
      throw new Error("No bearer token returned by login endpoint.");
    }

    const expiresAt = resolveTokenExpiry(payload);
    pic2bimAuthState.token = token;
    pic2bimAuthState.expiresAt = expiresAt;
    return token;
  };

  const ensureToken = async () => {
    const now = Date.now();
    if (
      pic2bimAuthState.token &&
      pic2bimAuthState.expiresAt - PIC2BIM_TOKEN_BUFFER_MS > now
    ) {
      return pic2bimAuthState.token;
    }
    return requestToken();
  };

  const normalizeLongitude = (value) => {
    const longitude = Number.parseFloat(value);
    if (!Number.isFinite(longitude)) {
      return value;
    }
    return longitude > 0 ? -Math.abs(longitude) : longitude;
  };

  const parseGeojson = (candidate) => {
    if (!candidate) {
      return null;
    }
    if (typeof candidate === "string") {
      try {
        return JSON.parse(candidate);
      } catch (error) {
        console.error("Unable to parse GeoJSON string", error);
        return null;
      }
    }
    if (candidate.type) {
      return candidate;
    }
    return null;
  };

  const resolveBuildingCandidate = (payload) => {
    if (!payload) {
      return null;
    }
    if (Array.isArray(payload)) {
      for (const item of payload) {
        const candidate = resolveBuildingCandidate(item);
        if (candidate) {
          return candidate;
        }
      }
      return null;
    }
    if (payload.geojson) {
      return payload;
    }
    if (payload.building_part) {
      return resolveBuildingCandidate(payload.building_part);
    }
    if (payload.data) {
      return resolveBuildingCandidate(payload.data);
    }
    if (payload.result) {
      return resolveBuildingCandidate(payload.result);
    }
    if (payload.type && payload.features) {
      return { geojson: payload };
    }
    return null;
  };

  const parseBuildingResponse = (payload) => {
    const candidate = resolveBuildingCandidate(payload);
    if (!candidate) {
      return null;
    }

    const geojson = parseGeojson(candidate.geojson ?? candidate.geometry);
    if (!geojson) {
      return null;
    }

    const cameraSource = candidate.cameraGPSData || candidate.camera;
    const cameraArray = Array.isArray(cameraSource)
      ? cameraSource
      : cameraSource
        ? [cameraSource]
        : [];

    return {
      geojson,
      cameraGPSData: cameraArray,
      properties: candidate.properties ?? candidate.attributes ?? null,
    };
  };

  const fetchNearestBuilding = async ({ latitude, longitude, bearing }) => {
    const token = await ensureToken();
    if (!token) {
      throw new Error(
        "Unable to authenticate with pic2bim. Verify local credentials.",
      );
    }

    const normalizedLongitude = normalizeLongitude(longitude);
    const searchParams = new URLSearchParams({
      latitude: `${Number.parseFloat(latitude)}`,
      longitude: `${normalizedLongitude}`,
    });
    if (Number.isFinite(Number.parseFloat(bearing))) {
      searchParams.set("imagedirection", `${Number.parseFloat(bearing)}`);
    }

    const response = await fetch(
      `${PIC2BIM_DOMAIN}${PIC2BIM_BUILDING_PATH}?${searchParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.status === 401 || response.status === 403) {
      resetAuth();
      throw new Error("Authentication was rejected for the building request.");
    }

    if (!response.ok) {
      throw new Error(
        `Building request failed (${response.status}: ${response.statusText}).`,
      );
    }

    const payload = await response.json().catch(() => null);
    const parsed = parseBuildingResponse(payload);
    if (!parsed) {
      return null;
    }

    return parsed;
  };

  const normalizeBuildingFeatures = (geojson) => {
    if (!geojson) {
      return [];
    }

    if (
      geojson.type === "FeatureCollection" &&
      Array.isArray(geojson.features)
    ) {
      return geojson.features.filter((feature) => {
        const type = feature?.geometry?.type;
        return type === "Polygon" || type === "MultiPolygon";
      });
    }

    if (geojson.type === "Feature") {
      const type = geojson.geometry?.type;
      if (type === "Polygon" || type === "MultiPolygon") {
        return [geojson];
      }
      return [];
    }

    if (geojson.type === "Polygon" || geojson.type === "MultiPolygon") {
      return [
        {
          type: "Feature",
          geometry: geojson,
          properties: geojson.properties ?? {},
        },
      ];
    }

    return [];
  };

  const parseBuildingHeight = (properties = {}) => {
    const parseNumber = (value) => {
      const number = Number.parseFloat(value);
      return Number.isFinite(number) ? number : null;
    };

    const directHeight =
      parseNumber(properties.height) ??
      parseNumber(properties["building:height"]);
    if (directHeight !== null) {
      return directHeight;
    }

    const relativeHeight =
      parseNumber(properties.relativeheightmaximum) ??
      parseNumber(properties.relativeHeightMaximum);
    if (relativeHeight !== null) {
      return relativeHeight;
    }

    const absoluteMax = parseNumber(properties.absoluteheightmaximum);
    const absoluteMin = parseNumber(properties.absoluteheightminimum);
    if (absoluteMax !== null && absoluteMin !== null) {
      const difference = absoluteMax - absoluteMin;
      if (Number.isFinite(difference) && difference > 0) {
        return difference;
      }
    }

    const levels =
      parseNumber(properties.building_levels) ??
      parseNumber(properties.levels) ??
      parseNumber(properties["building:levels"]);
    if (levels !== null) {
      return Math.max(levels, 1) * 3;
    }

    return 12;
  };

  global.pic2bimBuilding = {
    fetchNearestBuilding,
    normalizeBuildingFeatures,
    parseBuildingHeight,
  };
})(window);
