import "dotenv/config";

const getopenRouterResponse = async (message) => {
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "nvidia/nemotron-3-super-120b-a12b:free",
          messages: [
            {
              role: "user",
              content: message,
            },
          ],
        }),
      },
    );

    const data = await response.json();

  // 🔥 SAFE CHECK
  if (!data.choices || data.choices.length === 0) {
    console.log("OpenRouter Error:", data);
    return "No response from AI";
  }
    // console.log(data.choices[0].message.content);
    return data.choices[0].message.content;
  } catch (err) {
    console.log(err);
  }
};

export default getopenRouterResponse;
