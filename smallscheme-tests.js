
let x = 0

function addTest(resultsTable, input, expectedResult) {
    let val = eval(input)
    let rest = Array.isArray(val) ? val[1] : val
    let isGood = rest == expectedResult
    let testRow = resultsTable.insertRow(isGood ? -1 : 1)

    let testIdCell  = testRow.insertCell(-1)
    testIdCell.innerText = "Test #"+(x++)

    let inputCell   = testRow.insertCell(-1)
    inputCell.innerText = input

    let restCell        = testRow.insertCell(-1)
    restCell.innerText  = String(rest)

    let resultCell  = testRow.insertCell(-1)
    resultCell.innerText = isGood ? "PASS" : "FAILED"
    resultCell.style.color = isGood ? "green" : "red"

    let commentCell = testRow.insertCell(-1)
    commentCell.innerText = isGood ? "" : "was expecting "+String(expectedResult)
}

resultsTable = document.getElementById("results")
if (resultsTable) {
    addTest(resultsTable, 'SmallScheme.lex_comment("; adsasffdjjjj   ffff ;;  fff\\nhello")', "hello")
    addTest(resultsTable, 'SmallScheme.lex_atmosphere(" hello")', "hello")
    addTest(resultsTable, 'SmallScheme.lex_atmosphere("\thello")', "hello")
    addTest(resultsTable, 'SmallScheme.lex_atmosphere(";ddddd ; \\nhello")', "hello")
    addTest(resultsTable, 'SmallScheme.lex_atmosphere("- hello")', false)
    addTest(resultsTable, 'SmallScheme.lex_intertokenSpace("\t\t \t  ;blabla\\nhello")', "hello")
    addTest(resultsTable, 'SmallScheme.lex_intertokenSpace("hello")', "hello")
    addTest(resultsTable, 'SmallScheme.lex_letter("Allo")', "llo")
    addTest(resultsTable, 'SmallScheme.lex_letter("allo")', "llo")
    addTest(resultsTable, 'SmallScheme.lex_letter("Zllo")', "llo")
    addTest(resultsTable, 'SmallScheme.lex_letter("zllo")', "llo")
    addTest(resultsTable, 'SmallScheme.lex_letter("yllo")', "llo")
    addTest(resultsTable, 'SmallScheme.lex_letter("?llo")', false)
    addTest(resultsTable, 'SmallScheme.lex_specialInitial("?llo")', "llo")
    addTest(resultsTable, 'SmallScheme.lex_specialInitial("Allo")', false)
    addTest(resultsTable, 'SmallScheme.lex_specialInitial("&llo")', "llo")
    addTest(resultsTable, 'SmallScheme.lex_initial("&llo")', "llo")
    addTest(resultsTable, 'SmallScheme.lex_initial("allo")', "llo")
    addTest(resultsTable, 'SmallScheme.lex_initial("?llo")', "llo")
    addTest(resultsTable, 'SmallScheme.lex_initial("1llo")', false)
    addTest(resultsTable, 'SmallScheme.lex_digit("1llo")', "llo")
    addTest(resultsTable, 'SmallScheme.lex_digit("0llo")', "llo")
    addTest(resultsTable, 'SmallScheme.lex_digit("94llo")', "4llo")
    addTest(resultsTable, 'SmallScheme.lex_digit("hell0")', false)
    addTest(resultsTable, 'SmallScheme.lex_specialSubsequent("@llo")', "llo")
    addTest(resultsTable, 'SmallScheme.lex_specialSubsequent(".llo")', "llo")
    addTest(resultsTable, 'SmallScheme.lex_specialSubsequent("+llo")', "llo")
    addTest(resultsTable, 'SmallScheme.lex_specialSubsequent("-llo")', "llo")
    addTest(resultsTable, 'SmallScheme.lex_specialSubsequent("allo")', false)
    addTest(resultsTable, 'SmallScheme.lex_specialSubsequent("4llo")', false)
    addTest(resultsTable, 'SmallScheme.lex_peculiarSubsequent("+llo")', "llo")
    addTest(resultsTable, 'SmallScheme.lex_peculiarSubsequent("-llo")', "llo")
    addTest(resultsTable, 'SmallScheme.lex_peculiarSubsequent("...llo")', "llo")
    addTest(resultsTable, 'SmallScheme.lex_peculiarSubsequent("..llo")', false)
    addTest(resultsTable, 'SmallScheme.lex_peculiarSubsequent(".llo")', false)
    addTest(resultsTable, 'SmallScheme.lex_peculiarSubsequent("4llo")', false)
    addTest(resultsTable, 'SmallScheme.lex_subsequent("4llo")', "llo")
    addTest(resultsTable, 'SmallScheme.lex_subsequent("...allo")', "..allo")
    addTest(resultsTable, 'SmallScheme.lex_identifier("...allo rest")', "allo rest")
    addTest(resultsTable, 'SmallScheme.lex_identifier("!!allo rest")', " rest")
    addTest(resultsTable, 'SmallScheme.lex_identifier("<allo> rest")', " rest")
    addTest(resultsTable, 'SmallScheme.lex_identifier("+ rest")', " rest")
    addTest(resultsTable, 'SmallScheme.lex_identifier("+allo rest")', "allo rest")
    addTest(resultsTable, 'SmallScheme.lex_identifier("-allo rest")', "allo rest")
    addTest(resultsTable, 'SmallScheme.lex_identifier("!+allo rest")', " rest")
    addTest(resultsTable, 'SmallScheme.lex_identifier("allo+allo rest")', " rest")
    addTest(resultsTable, 'SmallScheme.lex_identifier("@allo rest")', false)
    addTest(resultsTable, 'SmallScheme.lex_identifier(".allo rest")', false)
    addTest(resultsTable, 'SmallScheme.lex_identifier("allo.allo rest")', " rest")
    addTest(resultsTable, 'SmallScheme.lex_identifier("allo@allo rest")', " rest")
    addTest(resultsTable, 'SmallScheme.lex_identifier("123allo rest")', false)
    addTest(resultsTable, 'SmallScheme.lex_identifier("allo123 rest")', " rest")
    // addTest(resultsTable, 'SmallScheme.lex_keyword("elserest")', "rest")
    // addTest(resultsTable, 'SmallScheme.lex_keyword("quoterest")', "rest")
    // addTest(resultsTable, 'SmallScheme.lex_keyword("=>rest")', "rest")
    // addTest(resultsTable, 'SmallScheme.lex_keyword("quasiquot")', false)
    // addTest(resultsTable, 'SmallScheme.lex_keyword("quasiquote")', "")
    addTest(resultsTable, 'SmallScheme.lex_bool("#tallo")', "allo")
    addTest(resultsTable, 'SmallScheme.lex_bool("#fallo")', "allo")
    addTest(resultsTable, 'SmallScheme.lex_bool("#Fallo")', "allo")
    addTest(resultsTable, 'SmallScheme.lex_bool("#Jallo")', false)
}
