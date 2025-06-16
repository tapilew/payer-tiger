const BASE_URL = "http://localhost:3000/api/app"; // Update if your dev server runs elsewhere

async function testPost(creatorHandle: string, contentId: string) {
    const url = `${BASE_URL}?creatorHandle=${
        encodeURIComponent(creatorHandle)
    }&contentId=${encodeURIComponent(contentId)}`;
    // Use global fetch if available, otherwise import node-fetch with type cast
    let fetchFn: typeof fetch;
    if (typeof fetch === "undefined") {
        fetchFn = (await import("node-fetch"))
            .default as unknown as typeof fetch;
    } else {
        fetchFn = fetch;
    }
    try {
        const res = await fetchFn(url, { method: "POST" });
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Response:", data);
    } catch (err) {
        console.error("Error:", err);
    }
}

// Example usage:
testPost("creator1", "abc123");
