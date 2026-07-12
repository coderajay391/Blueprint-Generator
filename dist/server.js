// server.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var apiKey = process.env.GEMINI_API_KEY;
var ai = apiKey ? new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
}) : null;
var app = express();
var PORT = 3e3;
app.use(express.json());
app.post("/api/generate-blueprint", async (req, res) => {
  try {
    const { prompt, style = "standard" } = req.body;
    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "Missing or invalid prompt string." });
      return;
    }
    if (!ai) {
      res.json(getFallbackBlueprint(prompt));
      return;
    }
    const systemInstruction = `You are a world-class, beginner-friendly full-stack developer and computer science educator. 
Your goal is to explain and generate a full-stack architecture starting boilerplate for a specific application.
You must return your response in raw JSON format matching the schema requested below.
Write exceptionally clean, well-commented code. The comments should explain "why" things are done, not just "what" is done.
Target absolute beginners who have just learned basic JavaScript and want to understand how React (Frontend) communicates with Express (Backend).

The React frontend code MUST:
1. Be a single self-contained, beautifully formatted file (like an educational App.tsx).
2. Utilize 'useState', 'useEffect', and 'fetch()' to communicate with the Node.js backend.
3. Be highly visual, modern, and modern-looking, using Tailwind classes.
4. Include inline comments pointing out React hooks, State updates, event handling, and conditional rendering.

The Express backend code MUST:
1. Be a simple, clean Node.js server.js file.
2. Use standard Express middleware like express.json() and cors().
3. Setup at least 2 REST API endpoints (e.g., a GET and a POST) to support the app.
4. Use a local array to simulate database storage, clearly explaining how persistence works.
5. Include inline comments explaining Express routing, request bodies, response statuses, and JSON serialization.

The response must be in JSON format matching this TypeScript interface structure:
{
  "appName": "string",
  "description": "string",
  "learningObjectives": ["string"],
  "frontend": {
    "fileName": "App.tsx",
    "language": "typescript",
    "code": "string (React functional component code)",
    "explanation": "string (Brief summary of what this code does)",
    "annotations": [
      {
        "lineKeyword": "string (A unique keyword or phrase in the code to highlight/explain)",
        "title": "string (Short header for explanation)",
        "explanation": "string (Detailed step-by-step breakdown)"
      }
    ]
  },
  "backend": {
    "fileName": "server.js",
    "language": "javascript",
    "code": "string (Express backend code)",
    "explanation": "string (Brief summary of Express code)",
    "annotations": [
      {
        "lineKeyword": "string (A unique keyword or phrase in the code to highlight/explain)",
        "title": "string (Short header for explanation)",
        "explanation": "string (Detailed step-by-step breakdown)"
      }
    ]
  },
  "database": {
    "dialect": "MongoDB / Mongoose",
    "schemaCode": "string (Starter Mongoose Schema definition using Schema and mongoose.model)",
    "explanation": "string (Step-by-step explanation of Schemas, fields, references, and validation)"
  },
  "folderStructure": [
    {
      "name": "string",
      "type": "file | directory",
      "description": "string"
    }
  ],
  "readme": "string (A markdown formatted README designed for beginners with prerequisites, run instructions, and explanations)",
  "envGuide": {
    "variables": [
      { "name": "string", "defaultValue": "string", "description": "string" }
    ],
    "guideText": "string (Beginner-friendly explanation of .env files and security)"
  },
  "requestFlow": [
    {
      "step": 1,
      "component": "Frontend UI",
      "description": "e.g., User clicks the button"
    }
  ]
}`;
    const modelName = "gemini-3.5-flash";
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Generate a beginner-friendly full-stack blueprint for: "${prompt}". Focus on making the codebase highly educational.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });
    if (!response.text) {
      throw new Error("No text returned from Gemini API");
    }
    const data = JSON.parse(response.text.trim());
    res.json(data);
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    res.status(500).json({
      error: "Failed to generate boilerplate",
      details: error.message || error
    });
  }
});
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa"
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
function getFallbackBlueprint(prompt) {
  return {
    appName: "Todo Planner Blueprint",
    description: "A complete beginner-friendly starter blueprint for a task manager app. Demonstrates GET/POST REST APIs, React states, and local storage simulation.",
    learningObjectives: [
      "Understand React state (useState) and data fetching (useEffect)",
      "Learn how to create Express REST API endpoints",
      "Visualize how JSON data travels from React client to Node.js server and back"
    ],
    frontend: {
      fileName: "App.tsx",
      language: "typescript",
      code: `import React, { useState, useEffect } from 'react';

export default function App() {
  // 1. STATE DEFINITIONS
  // useState holds the data. When state changes, React re-renders the visual UI automatically.
  const [tasks, setTasks] = useState<{ id: number; text: string; done: boolean }[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  // 2. FETCH DATA FROM BACKEND ON MOUNT
  // useEffect lets us run side effects. Placing empty brackets [] at the end 
  // means this code runs exactly ONCE when the component first mounts.
  useEffect(() => {
    fetch('/api/tasks')
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
        setLoading(false);
      })
      .catch((err) => console.error("Error fetching tasks:", err));
  }, []);

  // 3. SEND POST REQUEST TO ADD TASK
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: inputText })
    })
      .then((res) => res.json())
      .then((newTask) => {
        // Update the tasks state by copying the existing ones and appending the new task
        setTasks([...tasks, newTask]);
        setInputText('');
      });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
        <h1 className="text-2xl font-bold text-teal-400 mb-2">My Task Planner</h1>
        <p className="text-slate-400 text-sm mb-6">Learn full-stack by observing state updates!</p>

        {/* TASK FORM */}
        <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
          <input
            type="text"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-teal-400"
            placeholder="Add new educational goal..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold px-4 py-2 rounded-lg transition-colors">
            Add
          </button>
        </form>

        {/* LOADING INDICATOR */}
        {loading ? (
          <p className="text-slate-500 text-center animate-pulse">Fetching tasks from Node.js Express server...</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3 rounded-lg">
                <span className={task.done ? 'line-through text-slate-500' : ''}>{task.text}</span>
                <span className="text-xs text-teal-500 font-mono">id: {task.id}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}`,
      explanation: "This React frontend demonstrates component state, fetching records asynchronously from our server, and pushing new tasks dynamically into the backend simulation.",
      annotations: [
        {
          lineKeyword: "useState",
          title: "React State Hook (useState)",
          explanation: "useState allows React components to remember information like input texts or task arrays. When you call the setter (e.g., setTasks), React automatically updates the browser UI to match the new state."
        },
        {
          lineKeyword: "useEffect",
          title: "React Side Effect Hook (useEffect)",
          explanation: "useEffect executes code after the visual rendering finishes. By using an empty dependency array [], this script requests data from '/api/tasks' exactly once, simulating an initial fetch from a database."
        },
        {
          lineKeyword: "fetch('/api/tasks')",
          title: "Network HTTP Request",
          explanation: "fetch() sends an asynchronous HTTP call across the local network to our backend Express server. React awaits a JSON list of tasks, parsing them into our React tasks state."
        }
      ]
    },
    backend: {
      fileName: "server.js",
      language: "javascript",
      code: `const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

// 1. ENABLE MIDDLEWARE
// Enable CORS so our frontend can securely make requests to a different port
app.use(cors());
// Parse incoming JSON body payloads so we can access them in req.body
app.use(express.json());

// 2. SIMULATE DATABASE IN-MEMORY
// Standard array to persist data temporarily. Since it's in the server memory,
// resetting the server will wipe this, showing why we need physical databases later!
let taskDatabase = [
  { id: 1, text: "Learn Express Router", done: false },
  { id: 2, text: "Connect frontend to backend", done: false }
];

// 3. REST ENDPOINT: GET ALL TASKS
app.get('/api/tasks', (req, res) => {
  console.log("GET /api/tasks called! Sending tasks back to React.");
  // Respond with a status of 200 (Success) and send database array as JSON
  res.status(200).json(taskDatabase);
});

// 4. REST ENDPOINT: CREATE NEW TASK
app.post('/api/tasks', (req, res) => {
  const { text } = req.body;
  console.log(\`POST /api/tasks called with text: "\${text}"\`);

  const newTask = {
    id: taskDatabase.length + 1,
    text: text || "Untitled Task",
    done: false
  };

  // Push new task item to our simulated database array
  taskDatabase.push(newTask);

  // Return the newly created resource back to the React UI
  res.status(201).json(newTask);
});

app.listen(PORT, () => {
  console.log(\`Express educational server running on http://localhost:\${PORT}\`);
});`,
      explanation: "This Express.js application establishes two simple endpoints. It utilizes express.json() to parse payloads and a local Javascript array to simulate an absolute beginner-friendly database storage workflow.",
      annotations: [
        {
          lineKeyword: "express.json()",
          title: "JSON Parser Middleware",
          explanation: "By default, Node.js sees raw HTTP request bodies as raw streams of bytes. express.json() automatically intercept incoming bodies, parses them from JSON text, and populates 'req.body' for easy access."
        },
        {
          lineKeyword: "app.get('/api/tasks'",
          title: "HTTP GET Endpoint Routing",
          explanation: "Defines an API route that responds only to GET requests. In RESTful terms, GET signifies fetching resources. We return the current simulated database array in JSON."
        },
        {
          lineKeyword: "taskDatabase.push",
          title: "In-Memory Simulation",
          explanation: "A simple JS array serves as a temporary in-memory database. Resetting or deploying the container will clear this data. For production, we substitute this with persistent databases like PostgreSQL."
        }
      ]
    },
    database: {
      dialect: "MongoDB / Mongoose",
      schemaCode: `const mongoose = require('mongoose');

// 1. DEFINE SCHEMA STRUCTURE
// A Schema maps out exactly what document attributes can be stored in a collection.
const TaskSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Please provide the task text content'],
    trim: true,
    maxlength: [255, 'Task text cannot exceed 255 characters']
  },
  done: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Automatically adds 'createdAt' and 'updatedAt' fields!
});

// 2. COMPILE SCHEMA INTO A MODEL
// The model provides Mongoose query helper methods like Task.find() and Task.create()
const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;`,
      explanation: "MongoDB is a NoSQL, Document-oriented database. Rather than rows and columns, it stores records inside JSON-like documents. Mongoose is the Object Data Modeling (ODM) library for Node.js, providing schema validation, type enforcement, and helper hooks to write neat code!"
    },
    folderStructure: [
      {
        name: "my-fullstack-app",
        type: "directory",
        description: "The root of your workspace."
      },
      {
        name: "frontend/",
        type: "directory",
        description: "Contains all user interface code compiled with React."
      },
      {
        name: "frontend/src/App.tsx",
        type: "file",
        description: "Your main React page where visual elements and backend fetches live."
      },
      {
        name: "backend/",
        type: "directory",
        description: "Contains Node.js server configurations, REST routers, and database setups."
      },
      {
        name: "backend/server.js",
        type: "file",
        description: "The entry point for Express to listen for incoming frontend connections."
      },
      {
        name: "package.json",
        type: "file",
        description: "Defines third-party libraries (dependencies) like express, react, and tailwind."
      },
      {
        name: ".env",
        type: "file",
        description: "Stores sensitive configurations like database passwords and API keys safely."
      }
    ],
    readme: `# Full-Stack Learning Blueprint

Welcome! This is an educational codebase designed to help you understand the relationship between a React frontend and an Express backend.

## How It Works
1. **Frontend (React)** boots on port \`3000\`. It renders a task form and a dynamic list.
2. **Backend (Express)** boots on port \`5000\`. It holds an in-memory database array.
3. When the React app loads, it makes an HTTP \`GET\` request to \`/api/tasks\`.
4. When you add a new item, it sends an HTTP \`POST\` with JSON payload to \`/api/tasks\`.

## Prerequisite Check
Ensure you have [Node.js](https://nodejs.org) installed on your system.

## Setup Instructions

### 1. Backend Server Setup
Navigate into the backend project, install packages, and boot the server:
\`\`\`bash
cd backend
npm install express cors
node server.js
\`\`\`

### 2. Frontend React Setup
Open a new terminal window, navigate into frontend, install packages, and boot:
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

Open your browser to the URL displayed in your terminal (usually \`http://localhost:3000\`) to interact!`,
    envGuide: {
      variables: [
        {
          name: "PORT",
          defaultValue: "5000",
          description: "The port number on which the Express backend will listen for requests."
        },
        {
          name: "MONGODB_URI",
          defaultValue: "mongodb+srv://username:password@cluster0.mongodb.net/task_planner_db",
          description: "The secure connection URI string used by Node.js to communicate with your MongoDB cluster or local instance."
        },
        {
          name: "CORS_ORIGIN",
          defaultValue: "http://localhost:3000",
          description: "Specifies which client URL is allowed to access backend endpoints securely."
        }
      ],
      guideText: "Environment variables (.env files) are local key-value pairs kept separate from your code. This is crucial for security so you never upload database passwords, secret keys, or configurations to public repositories like GitHub."
    },
    requestFlow: [
      {
        step: 1,
        component: "Frontend React UI",
        description: "User types a new task and presses the 'Add' button. This fires the Form submit handler."
      },
      {
        step: 2,
        component: "HTTP Fetch POST Call",
        description: "The client makes a 'fetch' request to '/api/tasks' with method 'POST', sending the task text inside the body as a JSON string."
      },
      {
        step: 3,
        component: "Express Route Receiver",
        description: "The Express backend server receives the HTTP request. It matches the route 'POST /api/tasks' and triggers the handler function."
      },
      {
        step: 4,
        component: "Express Middleware",
        description: "express.json() parses the raw HTTP body string, converting it back to a Javascript object so the route can read it at 'req.body.text'."
      },
      {
        step: 5,
        component: "In-Memory DB Mutation",
        description: "The server creates a new task object, pushes it into the 'taskDatabase' array, and logs the action on the terminal."
      },
      {
        step: 6,
        component: "HTTP Response",
        description: "The backend server returns the new task object as JSON with a 210/201 'Created' status code."
      },
      {
        step: 7,
        component: "React State Update & Re-render",
        description: "The frontend receives the JSON response. It calls 'setTasks([...tasks, newTask])', updating state and triggering React to immediately draw the new task in the browser!"
      }
    ]
  };
}
//# sourceMappingURL=server.js.map
