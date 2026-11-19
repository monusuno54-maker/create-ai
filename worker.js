export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/generate") {
      try {
        const { prompt } = await request.json();

        if (!prompt || !prompt.trim()) {
          return Response.json(
            { error: "Please enter a prompt." },
            { status: 400 }
          );
        }

        if (!env.AI) {
          return Response.json(
            { error: "AI binding is not connected yet." },
            { status: 503 }
          );
        }

        const result = await env.AI.run(
          "@cf/black-forest-labs/flux-1-schnell",
          { prompt: prompt.trim() }
        );

        return Response.json({
          success: true,
          image: "data:image/jpeg;base64," + result.image
        });

      } catch (error) {
        return Response.json(
          { error: "Image generation failed." },
          { status: 500 }
        );
      }
    }

    return new Response("CREATE AI Worker is running!");
  }
};
