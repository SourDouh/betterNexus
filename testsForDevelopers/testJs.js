import { readFileSync } from 'fs';
import { parseArgs } from 'util';

/**
 * Execute JavaScript code and validate output against expected result.
 * 
 * TO USE:
 * run this script with node, providing two arguments:
 * @param {string} jsFilePath - Path to JavaScript file to execute
 * @param {string} expectedOutput - Expected output value
 * Example: node /testsForDevelopers/testJs.js /testsForDevelopers/testTheTest.js 4
 * 
 * 
 * To check includeHtml.js uncomment the following lines: 26, 
 */

function testJavaScriptExecution(jsFilePath, expectedOutput) {
    console.log("Executing JavaScript file: " + jsFilePath);
    
    try {
        // Read JavaScript code from file
        const jsCode = readFileSync(jsFilePath, "utf-8");
    
        //This code is for testing includeHTML.js
        //jsCode+="\n includeHTML(waivers);"
       
        // Execute the JavaScript code and capture output
        let actualOutput;
        try {
            actualOutput = eval(jsCode)
        } catch (e) {
            console.log("JavaScript execution failed");
            console.log("Error: " + e);
            return false;
        }
        
        // Validate output        
        if (actualOutput == expectedOutput) {
            console.log("✔ Test passed: Output matches expected value");
            console.log("   Expected: " + expectedOutput);
            console.log("   Actual: " + actualOutput);
            return true;
        } else {
            console.log("✘ Test failed: Output doesn't match expected value");
            console.log("   Expected: " + expectedOutput);
            console.log("   Actual: " + actualOutput);
            return false;
        }
        
    } catch (error) {
        if (error.code === "ENOENT") {
            console.log("Error: JavaScript file not found: " + jsFilePath);
        } else {
            console.log("Error occurred: " + error.message);
        }
        return false;
    }
}

// Parse command line arguments
const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {},
    allowPositionals: true
});

if (positionals.length < 2) {
    console.log("Expected 2 arguments but got " + positionals.length + ", continuing anyway.");
    console.log("Usage: node script.js <js_file> <expected_output>");
}

const [jsFile, expectedOutput] = positionals;

// Run the test
testJavaScriptExecution(jsFile, expectedOutput);