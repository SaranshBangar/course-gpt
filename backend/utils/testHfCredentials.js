require("dotenv").config();
const { HfInference } = require("@huggingface/inference");

const testCredentials = async () => {
  console.log("Testing Hugging Face credentials");
  console.log("HF_ACCESS_TOKEN available:", !!process.env.HF_ACCESS_TOKEN);

  try {
    const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

    const response = await hf.textGeneration({
      model: "google/flan-t5-xxl",
      inputs: "Test prompt: Hello, world!",
      parameters: {
        max_length: 20,
      },
    });

    console.log("Authentication successful!");
    console.log("Response:", response.generated_text);
    return true;
  } catch (error) {
    console.error("Authentication failed:", error.message);

    if (!process.env.HF_ACCESS_TOKEN) {
      console.error("No token found in environment variables. Make sure HF_ACCESS_TOKEN is set in your .env file.");
    } else if (process.env.HF_ACCESS_TOKEN.startsWith("hf_")) {
      console.log("Token format appears correct (starts with 'hf_')");
    } else {
      console.error("Token format may be incorrect. Hugging Face tokens typically start with 'hf_'");
    }

    return false;
  }
};

if (require.main === module) {
  testCredentials();
}

module.exports = { testCredentials };
