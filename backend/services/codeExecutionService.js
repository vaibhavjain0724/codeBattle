const axios = require("axios")
const fs = require("fs")
const path = require("path")
const { exec } = require("child_process")

const FILE_NAMES = {
    nodejs: "index.js",
    javascript: "index.js",
    python: "main.py",
    cpp: "main.cpp",
    java: "Main.java",
}

// Helper to run shell command with stdin input
const runLocalCmd = (cmd, stdinInput, options = {}) => {
    return new Promise((resolve) => {
        const child = exec(cmd, options, (error, stdout, stderr) => {
            resolve({
                stdout: stdout || "",
                stderr: stderr || "",
                error: error ? error.message : null
            })
        })

        if (child.stdin) {
            try {
                if (stdinInput !== undefined && stdinInput !== null && stdinInput !== "") {
                    child.stdin.write(String(stdinInput))
                }
                child.stdin.end()
            } catch (_) {}
        }
    })
}

// Local runners
const runLocalJS = async (code, stdin) => {
    const dirName = "exec_" + Math.random().toString(36).substring(2, 10)
    const tempDir = path.join(__dirname, "..", "temp_exec", dirName)
    fs.mkdirSync(tempDir, { recursive: true })
    const jsFile = path.join(tempDir, "main.js")
    fs.writeFileSync(jsFile, code)

    const startTime = Date.now()
    const runRes = await runLocalCmd(`node "${jsFile}"`, stdin, { timeout: 5000 })
    const executionTime = Date.now() - startTime

    try { fs.rmSync(tempDir, { recursive: true, force: true }) } catch (_) {}

    return {
        status: "success",
        stdout: runRes.stdout,
        stderr: runRes.stderr,
        exception: runRes.error ? (runRes.error.includes("timeout") ? "Time Limit Exceeded" : runRes.error) : null,
        executionTime
    }
}

const runLocalPython = async (code, stdin) => {
    const dirName = "exec_" + Math.random().toString(36).substring(2, 10)
    const tempDir = path.join(__dirname, "..", "temp_exec", dirName)
    fs.mkdirSync(tempDir, { recursive: true })
    const pyFile = path.join(tempDir, "main.py")
    fs.writeFileSync(pyFile, code)

    const startTime = Date.now()
    const runRes = await runLocalCmd(`python3 "${pyFile}"`, stdin, { timeout: 5000 })
    const executionTime = Date.now() - startTime

    try { fs.rmSync(tempDir, { recursive: true, force: true }) } catch (_) {}

    return {
        status: "success",
        stdout: runRes.stdout,
        stderr: runRes.stderr,
        exception: runRes.error ? (runRes.error.includes("timeout") ? "Time Limit Exceeded" : runRes.error) : null,
        executionTime
    }
}

const runLocalCpp = async (code, stdin) => {
    const dirName = "exec_" + Math.random().toString(36).substring(2, 10)
    const tempDir = path.join(__dirname, "..", "temp_exec", dirName)
    fs.mkdirSync(tempDir, { recursive: true })
    const cppFile = path.join(tempDir, "main.cpp")
    const binaryFile = path.join(tempDir, "main.out")
    fs.writeFileSync(cppFile, code)

    // Compile (include path for bits/stdc++.h fallback on macOS)
    const includePath = path.join(__dirname, "..", "temp_exec")
    const compileRes = await runLocalCmd(`g++ -O3 -I "${includePath}" "${cppFile}" -o "${binaryFile}"`, "")
    if (compileRes.error || compileRes.stderr) {
        try { fs.rmSync(tempDir, { recursive: true, force: true }) } catch (_) {}
        return {
            status: "success",
            stdout: "",
            stderr: compileRes.stderr || compileRes.error,
            exception: "Compilation Error"
        }
    }

    // Run binary
    const startTime = Date.now()
    const runRes = await runLocalCmd(`"${binaryFile}"`, stdin, { timeout: 5000 })
    const executionTime = Date.now() - startTime

    try { fs.rmSync(tempDir, { recursive: true, force: true }) } catch (_) {}

    return {
        status: "success",
        stdout: runRes.stdout,
        stderr: runRes.stderr,
        exception: runRes.error ? (runRes.error.includes("timeout") ? "Time Limit Exceeded" : runRes.error) : null,
        executionTime
    }
}

const runLocalJava = async (code, stdin) => {
    const dirName = "exec_" + Math.random().toString(36).substring(2, 10)
    const tempDir = path.join(__dirname, "..", "temp_exec", dirName)
    fs.mkdirSync(tempDir, { recursive: true })
    const javaFile = path.join(tempDir, "Main.java")
    fs.writeFileSync(javaFile, code)

    // Compile
    const compileRes = await runLocalCmd(`javac "${javaFile}"`, "")
    if (compileRes.error || compileRes.stderr) {
        try { fs.rmSync(tempDir, { recursive: true, force: true }) } catch (_) {}
        return {
            status: "success",
            stdout: "",
            stderr: compileRes.stderr || compileRes.error,
            exception: "Compilation Error"
        }
    }

    // Run
    const startTime = Date.now()
    const runRes = await runLocalCmd(`java -cp "${tempDir}" Main`, stdin, { timeout: 5000 })
    const executionTime = Date.now() - startTime

    try { fs.rmSync(tempDir, { recursive: true, force: true }) } catch (_) {}

    return {
        status: "success",
        stdout: runRes.stdout,
        stderr: runRes.stderr,
        exception: runRes.error ? (runRes.error.includes("timeout") ? "Time Limit Exceeded" : runRes.error) : null,
        executionTime
    }
}

const runCode = async (language, code, input) => {
    let result = null

    // Try OneCompiler API first
    try {
        const fileName = FILE_NAMES[language] || "main.txt"
        const response = await axios.post(
            "https://api.onecompiler.com/v1/run",
            {
                language: language,
                stdin: input || "",
                files: [
                    {
                        name: fileName,
                        content: code
                    }
                ]
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": process.env.ONECOMPILER_API_KEY
                },
                timeout: 6000
            }
        )
        result = response.data
    } catch (err) {
        console.warn("OneCompiler API request failed:", err.message)
    }

    // Fallback if OneCompiler failed or returned a credits/credits-limit error
    if (!result || result.status === "failed" || result.error) {
        console.log(`[CodeExecution] OneCompiler unavailable or credits empty. Falling back to local execution for ${language}...`)
        
        try {
            if (language === "cpp") {
                return await runLocalCpp(code, input)
            } else if (language === "python" || language === "python3") {
                return await runLocalPython(code, input)
            } else if (language === "nodejs" || language === "javascript") {
                return await runLocalJS(code, input)
            } else if (language === "java") {
                return await runLocalJava(code, input)
            }
        } catch (localErr) {
            console.error("Local compilation failed:", localErr.message)
        }
    }

    return result || { status: "failed", exception: "Execution failed (no compilers available)" }
}

module.exports = { runCode }