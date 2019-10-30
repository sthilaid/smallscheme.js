
let x = 0

function addTest(resultsTable, input, expectedResult) {
    let val = eval(input)
    let isGood = val == expectedResult
    let testRow = resultsTable.insertRow(-1)

    let testIdCell  = testRow.insertCell(-1)
    testIdCell.innerText = "Test #"+(x++)

    let inputCell   = testRow.insertCell(-1)
    inputCell.innerText = input

    let valCell     = testRow.insertCell(-1)
    valCell.innerText = String(val)

    let resultCell  = testRow.insertCell(-1)
    resultCell.innerText = isGood ? "PASS" : "FAILED"
    resultCell.style.color = isGood ? "green" : "red"

    if (!isGood) {
        let commentCell = testRow.insertCell(-1)
        commentCell.innerText = "was expecting "+String(expectedResult)
    }
}

resultsTable = document.getElementById("results")
if (resultsTable) {
    addTest(resultsTable, 'SmallScheme.parse_comment("; adsasffdjjjj   ffff ;;  fff\\nhello")', "hello")
    addTest(resultsTable, 'SmallScheme.parse_atmosphere(" hello")', "hello")
    addTest(resultsTable, 'SmallScheme.parse_atmosphere("\thello")', "hello")
    addTest(resultsTable, 'SmallScheme.parse_atmosphere(";ddddd ; \\nhello")', "hello")
    addTest(resultsTable, 'SmallScheme.parse_atmosphere("- hello")', false)
    addTest(resultsTable, 'SmallScheme.parse_intertokenSpace("\t\t \t  ;blabla\\nhello")', "hello")
    addTest(resultsTable, 'SmallScheme.parse_intertokenSpace("hello")', "hello")
    addTest(resultsTable, 'SmallScheme.parse_letter("Allo")', "llo")
    addTest(resultsTable, 'SmallScheme.parse_letter("allo")', "llo")
    addTest(resultsTable, 'SmallScheme.parse_letter("Zllo")', "llo")
    addTest(resultsTable, 'SmallScheme.parse_letter("zllo")', "llo")
    addTest(resultsTable, 'SmallScheme.parse_letter("yllo")', "llo")
    addTest(resultsTable, 'SmallScheme.parse_letter("?llo")', false)
    addTest(resultsTable, 'SmallScheme.parse_specialInitial("?llo")', "llo")
    addTest(resultsTable, 'SmallScheme.parse_specialInitial("Allo")', false)
    addTest(resultsTable, 'SmallScheme.parse_specialInitial("&llo")', "llo")
    addTest(resultsTable, 'SmallScheme.parse_initial("&llo")', "llo")
    addTest(resultsTable, 'SmallScheme.parse_initial("allo")', "llo")
    addTest(resultsTable, 'SmallScheme.parse_initial("?llo")', "llo")
    addTest(resultsTable, 'SmallScheme.parse_initial("1llo")', false)
    // addTest(resultsTable, 'SmallScheme.tokenize("(print \\"hello world\\")")')
    // addTest(resultsTable, 'SmallScheme.tokenize("(+ 1 2)")')
}
