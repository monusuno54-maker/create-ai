export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/generate" && request.method === "POST") {
      try {
        if (!env.AI) {
          return Response.json(
            { success: false, error: "Workers AI binding is missing." },
            { status: 503 }
          );
        }

        const body = await request.json();
        const prompt = body.prompt;

        if (typeof prompt !== "string" || !prompt.trim()) {
          return Response.json(
            { success: false, error: "Please enter an image prompt." },
            { status: 400 }
          );
        }

        if (prompt.length > 2048) {
          return Response.json(
            { success: false, error: "Prompt must be 2048 characters or less." },
            { status: 400 }
          );
        }

        const result = await env.AI.run(
          "@cf/black-forest-labs/flux-1-schnell",
          {
            prompt: prompt.trim(),
            steps: 4
          }
        );

        if (!result || !result.image) {
          throw new Error("AI did not return an image.");
        }

        return Response.json({
          success: true,
          image: result.image
        });

      } catch (error) {
        return Response.json(
          {
            success: false,
            error: error.message || "Image generation failed."
          },
          { status: 500 }
        );
      }
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response(
      "CREATE AI is running. Assets binding is missing.",
      { status: 503 }
    );
  }
}
