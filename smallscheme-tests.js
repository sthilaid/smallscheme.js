
let x = 0

function addTest(input, expectedResult) {
    let val = eval(input)
    let isGood = val == expectedResult
    return "Test #"+(x++)+": "+input + " => "+ String(val) + " : " + (isGood ? "PASS" : "FAILED") + "\n"
}

output = document.getElementById("output")
if (output) {
    let outputStr = ""
    outputStr += addTest('SmallScheme.parse_comment("; adsasffdjjjj   ffff ;;  fff\\nhello")', "hello")
    outputStr += addTest('SmallScheme.parse_atmosphere(" hello")', "hello")
    outputStr += addTest('SmallScheme.parse_atmosphere("\thello")', "hello")
    outputStr += addTest('SmallScheme.parse_atmosphere(";ddddd ; \\nhello")', "hello")
    outputStr += addTest('SmallScheme.parse_atmosphere("- hello")', false)
    outputStr += addTest('SmallScheme.tokenize("(print \\"hello world\\")")')
    outputStr += addTest('SmallScheme.tokenize("(+ 1 2)")')
    
    output.innerText = outputStr
}
