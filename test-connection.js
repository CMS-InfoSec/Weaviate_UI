// Simple connection test for Weaviate instance
const WEAVIATE_ENDPOINT = "https://weaviate.cmsinfosec.com/v1";

async function testConnection() {
  console.log("Testing connection to:", WEAVIATE_ENDPOINT);

  try {
    // Test /v1/meta endpoint
    console.log("Testing /v1/meta endpoint...");
    const metaResponse = await fetch(`${WEAVIATE_ENDPOINT}/meta`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      mode: "cors",
    });

    if (!metaResponse.ok) {
      throw new Error(
        `Meta endpoint failed: ${metaResponse.status} ${metaResponse.statusText}`,
      );
    }

    const metaData = await metaResponse.json();
    console.log("✅ Meta endpoint successful:", {
      version: metaData.version,
      hostname: metaData.hostname,
    });

    // Test /v1/schema endpoint
    console.log("Testing /v1/schema endpoint...");
    const schemaResponse = await fetch(`${WEAVIATE_ENDPOINT}/schema`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      mode: "cors",
    });

    if (!schemaResponse.ok) {
      throw new Error(
        `Schema endpoint failed: ${schemaResponse.status} ${schemaResponse.statusText}`,
      );
    }

    const schemaData = await schemaResponse.json();
    console.log("✅ Schema endpoint successful:", {
      classes: schemaData.classes ? schemaData.classes.length : 0,
    });

    // Test /v1/objects endpoint
    console.log("Testing /v1/objects endpoint...");
    const objectsResponse = await fetch(
      `${WEAVIATE_ENDPOINT}/objects?limit=1`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
      },
    );

    if (!objectsResponse.ok) {
      throw new Error(
        `Objects endpoint failed: ${objectsResponse.status} ${objectsResponse.statusText}`,
      );
    }

    const objectsData = await objectsResponse.json();
    console.log("✅ Objects endpoint successful:", {
      totalResults: objectsData.totalResults || 0,
    });

    console.log("\n🎉 All connections successful!");
  } catch (error) {
    console.error("❌ Connection test failed:", error.message);

    if (error.message.includes("CORS")) {
      console.log(
        "💡 This might be a CORS issue. In production, both the UI and API will be on the same domain.",
      );
    } else if (error.message.includes("Failed to fetch")) {
      console.log(
        "💡 Network connectivity issue. Check if the Weaviate instance is running and accessible.",
      );
    } else if (error.message.includes("404")) {
      console.log(
        "💡 Endpoint not found. Check if the Weaviate instance is properly configured.",
      );
    }
  }
}

// Run the test
testConnection();
