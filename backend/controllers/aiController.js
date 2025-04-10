const Course = require("../models/Course");
const { HfInference } = require("@huggingface/inference");
require("dotenv").config();

console.log("HF_ACCESS_TOKEN available:", !!process.env.HF_ACCESS_TOKEN);

let hf;
try {
  hf = new HfInference(process.env.HF_ACCESS_TOKEN);
  console.log("Hugging Face client initialized successfully");
} catch (error) {
  console.error("Error initializing Hugging Face client:", error);
}

const generateText = async (prompt) => {
  try {
    if (!hf) {
      throw new Error("Hugging Face client not properly initialized");
    }

    // Define models in order of preference with decreasing size
    const models = [
      "google/flan-t5-large", // Use smaller model instead of xxl as default
      "google/flan-t5-base",
      "google/flan-t5-small",
    ];

    let response = null;
    let error = null;

    // Try models in sequence until one works
    for (const model of models) {
      try {
        console.log(`Sending request to Hugging Face API with model: ${model}`);

        response = await hf.textGeneration({
          model: model,
          inputs: prompt,
          parameters: {
            max_length: 300, // Reduced from 512
            temperature: 0.7,
            top_p: 0.95,
            return_full_text: false, // Don't return the prompt text to save memory
          },
        });

        console.log(`Received successful response from model: ${model}`);
        break; // Exit loop if successful
      } catch (modelError) {
        console.error(`Error with model ${model}:`, modelError.message);
        error = modelError;
        // Continue to next model
      }
    }

    if (response) {
      return response.generated_text;
    } else {
      throw error || new Error("All models failed");
    }
  } catch (error) {
    console.error("Error generating text:", error);
    console.log("Using fallback response due to API error");
    return `I couldn't generate content for "${prompt}" due to resource limitations. Please try again with a simpler request or contact support.`;
  }
};

exports.generateLessonContent = async (req, res, next) => {
  try {
    const { topic, difficulty } = req.body;

    const prompt = `Generate a structured lesson about ${topic} at a ${difficulty} difficulty level. 
    Include the following sections: title, description, learning outcomes, key concepts, and activities.`;

    const generatedText = await generateText(prompt);

    let aiContent = {};

    try {
      const sections = generatedText.split("\n\n");

      aiContent = {
        title: sections[0] || `Introduction to ${topic}`,
        description: sections[1] || `This lesson covers the fundamentals of ${topic} at a ${difficulty} level.`,
        learningOutcomes: sections[2]?.split("\n").filter((item) => item.trim()) || [
          `Understand the basic concepts of ${topic}`,
          `Apply ${topic} principles to solve problems`,
        ],
        keyConcepts: sections[3]?.split("\n").filter((item) => item.trim()) || [`Core principles of ${topic}`, `${topic} best practices`],
        activities: sections[4]?.split("\n").filter((item) => item.trim()) || [
          `Interactive quiz on ${topic}`,
          `Hands-on project implementing ${topic}`,
        ],
      };
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      aiContent = {
        title: `Introduction to ${topic}`,
        description: `This lesson covers the fundamentals of ${topic} at a ${difficulty} level.`,
        learningOutcomes: [
          `Understand the basic concepts of ${topic}`,
          `Apply ${topic} principles to solve problems`,
          `Analyze and evaluate ${topic} implementations`,
        ],
        keyConcepts: [`Core principles of ${topic}`, `${topic} best practices`, `Modern approaches to ${topic}`],
        activities: [`Interactive quiz on ${topic}`, `Hands-on project implementing ${topic}`, `Group discussion about ${topic} applications`],
      };
    }

    res.status(200).json({
      success: true,
      data: aiContent,
    });
  } catch (error) {
    next(error);
  }
};

exports.enhanceContent = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: `Course not found with id of ${req.params.courseId}`,
      });
    }

    if (course.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to enhance this course`,
      });
    }

    const moduleToEnhance = course.modules[0];
    const lessonToEnhance = moduleToEnhance?.lessons[0];

    if (!moduleToEnhance || !lessonToEnhance) {
      return res.status(400).json({
        success: false,
        message: "No content to enhance in this course",
      });
    }

    const prompt = `Analyze this lesson on "${lessonToEnhance.title}" with description "${lessonToEnhance.content}".
    Provide 3 specific improvements that could make this lesson more engaging and effective.
    Also suggest 2 additional resources (like articles or videos) that would complement this lesson.`;

    const generatedSuggestions = await generateText(prompt);

    res.status(200).json({
      success: true,
      message: "Content enhancement suggestions generated",
      data: {
        suggestions: [
          {
            moduleIndex: 0,
            lessonIndex: 0,
            suggestedImprovements: generatedSuggestions,
            rawAIResponse: generatedSuggestions,
          },
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.generateCourseStructure = async (req, res, next) => {
  try {
    const { topic, targetAudience, difficulty } = req.body;

    console.log("Received request to generate course structure:", {
      topic,
      targetAudience,
      difficulty,
    });

    const prompt = `Generate a complete course structure for a ${difficulty} level course about ${topic} designed for ${targetAudience}.
    The structure should include a course title, description, and 3-5 modules.
    For each module, include: title, description, prerequisites, difficulty level, estimated time in minutes, and 2-3 lessons with topics.`;

    const generatedText = await generateText(prompt);

    const courseStructure = {
      title: `Complete ${topic} Course for ${targetAudience}`,
      description: `Comprehensive course on ${topic} designed specifically for ${targetAudience} at ${difficulty} level.`,
      modules: [
        {
          title: `Introduction to ${topic}`,
          description: `Learn the fundamentals of ${topic}`,
          prerequisites: [],
          difficulty: difficulty,
          estimatedTime: 120,
          lessons: [
            {
              topic: `${topic} Basics`,
              order: 1,
            },
            {
              topic: `${topic} History and Evolution`,
              order: 2,
            },
          ],
          order: 1,
        },
        {
          title: `Advanced ${topic} Concepts`,
          description: `Deepen your understanding of ${topic}`,
          prerequisites: [`Introduction to ${topic}`],
          difficulty: difficulty,
          estimatedTime: 180,
          lessons: [
            {
              topic: `${topic} in Practice`,
              order: 1,
            },
            {
              topic: `${topic} Case Studies`,
              order: 2,
            },
          ],
          order: 2,
        },
      ],
      rawAIResponse: generatedText,
    };

    res.status(200).json({
      success: true,
      data: courseStructure,
    });
  } catch (error) {
    next(error);
  }
};
