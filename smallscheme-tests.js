
let x = 0

function addTest(resultsTable, input, rest, isGood, comment) {
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
    commentCell.innerText = comment
}
function addLexTest(resultsTable, input, expectedResult) {
    let val     = eval(input)
    let rest    = Array.isArray(val) ? val[1] : val
    let isGood  = rest == expectedResult
    let comment = isGood ? "" : "was expecting "+String(expectedResult)
    addTest(resultsTable, input, rest, isGood, comment)
}
function addParseTest(resultsTable, input, expectedResult) {
    let val     = eval(input)
    let isGood  = val.length == expectedResult.length
    let error   = isGood ? "" : ("Expecting "+expectedResult.length+" tokens, got "+val.length)
    if (isGood) {
        for (let i=0; i<val.length; ++i) {
            if (val[i].type != expectedResult[i]) {
                isGood  = false
                error   = "expecting token #"+i+" to be "+expectedResult[i]+" but got "+val[i].type
                break
            }
        }
    }
    let comment = error
    addTest(resultsTable, input, "", isGood, comment)
}


resultsTable = document.getElementById("results")
if (resultsTable) {
    addLexTest(resultsTable, 'SmallScheme.lex_comment("; adsasffdjjjj   ffff ;;  fff\\nhello")', "hello")
    addLexTest(resultsTable, 'SmallScheme.lex_atmosphere(" hello")', "hello")
    addLexTest(resultsTable, 'SmallScheme.lex_atmosphere("\thello")', "hello")
    addLexTest(resultsTable, 'SmallScheme.lex_atmosphere(";ddddd ; \\nhello")', "hello")
    addLexTest(resultsTable, 'SmallScheme.lex_atmosphere("- hello")', false)
    addLexTest(resultsTable, 'SmallScheme.lex_intertokenSpace("\t\t \t  ;blabla\\nhello")', "hello")
    addLexTest(resultsTable, 'SmallScheme.lex_intertokenSpace("hello")', "hello")
    addLexTest(resultsTable, 'SmallScheme.lex_letter("Allo")', "llo")
    addLexTest(resultsTable, 'SmallScheme.lex_letter("allo")', "llo")
    addLexTest(resultsTable, 'SmallScheme.lex_letter("Zllo")', "llo")
    addLexTest(resultsTable, 'SmallScheme.lex_letter("zllo")', "llo")
    addLexTest(resultsTable, 'SmallScheme.lex_letter("yllo")', "llo")
    addLexTest(resultsTable, 'SmallScheme.lex_letter("?llo")', false)
    addLexTest(resultsTable, 'SmallScheme.lex_specialInitial("?llo")', "llo")
    addLexTest(resultsTable, 'SmallScheme.lex_specialInitial("Allo")', false)
    addLexTest(resultsTable, 'SmallScheme.lex_specialInitial("&llo")', "llo")
    addLexTest(resultsTable, 'SmallScheme.lex_initial("&llo")', "llo")
    addLexTest(resultsTable, 'SmallScheme.lex_initial("allo")', "llo")
    addLexTest(resultsTable, 'SmallScheme.lex_initial("?llo")', "llo")
    addLexTest(resultsTable, 'SmallScheme.lex_initial("1llo")', false)
    addLexTest(resultsTable, 'SmallScheme.lex_digit("1llo")', "llo")
    addLexTest(resultsTable, 'SmallScheme.lex_digit("0llo")', "llo")
    addLexTest(resultsTable, 'SmallScheme.lex_digit("94llo")', "4llo")
    addLexTest(resultsTable, 'SmallScheme.lex_digit("hell0")', false)
    addLexTest(resultsTable, 'SmallScheme.lex_specialSubsequent("@llo")', "llo")
    addLexTest(resultsTable, 'SmallScheme.lex_specialSubsequent(".llo")', "llo")
    addLexTest(resultsTable, 'SmallScheme.lex_specialSubsequent("+llo")', "llo")
    addLexTest(resultsTable, 'SmallScheme.lex_specialSubsequent("-llo")', "llo")
    addLexTest(resultsTable, 'SmallScheme.lex_specialSubsequent("allo")', false)
    addLexTest(resultsTable, 'SmallScheme.lex_specialSubsequent("4llo")', false)
    addLexTest(resultsTable, 'SmallScheme.lex_peculiarSubsequent("+llo")', "llo")
    addLexTest(resultsTable, 'SmallScheme.lex_peculiarSubsequent("-llo")', "llo")
    addLexTest(resultsTable, 'SmallScheme.lex_peculiarSubsequent("...llo")', "llo")
    addLexTest(resultsTable, 'SmallScheme.lex_peculiarSubsequent("..llo")', false)
    addLexTest(resultsTable, 'SmallScheme.lex_peculiarSubsequent(".llo")', false)
    addLexTest(resultsTable, 'SmallScheme.lex_peculiarSubsequent("4llo")', false)
    addLexTest(resultsTable, 'SmallScheme.lex_subsequent("4llo")', "llo")
    addLexTest(resultsTable, 'SmallScheme.lex_subsequent("...allo")', "..allo")
    addLexTest(resultsTable, 'SmallScheme.lex_identifier("...allo rest")', "allo rest")
    addLexTest(resultsTable, 'SmallScheme.lex_identifier("!!allo rest")', " rest")
    addLexTest(resultsTable, 'SmallScheme.lex_identifier("<allo> rest")', " rest")
    addLexTest(resultsTable, 'SmallScheme.lex_identifier("+ rest")', " rest")
    addLexTest(resultsTable, 'SmallScheme.lex_identifier("+allo rest")', "allo rest")
    addLexTest(resultsTable, 'SmallScheme.lex_identifier("-allo rest")', "allo rest")
    addLexTest(resultsTable, 'SmallScheme.lex_identifier("!+allo rest")', " rest")
    addLexTest(resultsTable, 'SmallScheme.lex_identifier("allo+allo rest")', " rest")
    addLexTest(resultsTable, 'SmallScheme.lex_identifier("@allo rest")', false)
    addLexTest(resultsTable, 'SmallScheme.lex_identifier(".allo rest")', false)
    addLexTest(resultsTable, 'SmallScheme.lex_identifier("allo.allo rest")', " rest")
    addLexTest(resultsTable, 'SmallScheme.lex_identifier("allo@allo rest")', " rest")
    addLexTest(resultsTable, 'SmallScheme.lex_identifier("123allo rest")', false)
    addLexTest(resultsTable, 'SmallScheme.lex_identifier("allo123 rest")', " rest")
    // addLexTest(resultsTable, 'SmallScheme.lex_keyword("elserest")', "rest")
    // addLexTest(resultsTable, 'SmallScheme.lex_keyword("quoterest")', "rest")
    // addLexTest(resultsTable, 'SmallScheme.lex_keyword("=>rest")', "rest")
    // addLexTest(resultsTable, 'SmallScheme.lex_keyword("quasiquot")', false)
    // addLexTest(resultsTable, 'SmallScheme.lex_keyword("quasiquote")', "")
    addLexTest(resultsTable, 'SmallScheme.lex_bool("#tallo")', "allo")
    addLexTest(resultsTable, 'SmallScheme.lex_bool("#fallo")', "allo")
    addLexTest(resultsTable, 'SmallScheme.lex_bool("#Fallo")', "allo")
    addLexTest(resultsTable, 'SmallScheme.lex_bool("#Jallo")', false)
    addLexTest(resultsTable, 'SmallScheme.lex_simple("(allo")', "allo")
    addLexTest(resultsTable, 'SmallScheme.lex_simple(")allo")', "allo")
    addLexTest(resultsTable, 'SmallScheme.lex_simple("#(allo")', "allo")
    addLexTest(resultsTable, 'SmallScheme.lex_simple("\'allo")', "allo")
    addLexTest(resultsTable, 'SmallScheme.lex_simple("`allo")', "allo")
    addLexTest(resultsTable, 'SmallScheme.lex_simple(",allo")', "allo")
    addLexTest(resultsTable, 'SmallScheme.lex_simple(",@allo")', "allo")
    addLexTest(resultsTable, 'SmallScheme.lex_simple(".allo")', "allo")
    addLexTest(resultsTable, 'SmallScheme.lex_simple("<allo")', false)
    addLexTest(resultsTable, 'SmallScheme.lex_simple("$allo")', false)
    addLexTest(resultsTable, 'SmallScheme.lex_token("$allo")', "")
    addLexTest(resultsTable, 'SmallScheme.lex_token("(allo")', "allo")
    addLexTest(resultsTable, 'SmallScheme.lex_token(".allo")', "allo")
    addLexTest(resultsTable, 'SmallScheme.lex_token("a.allo")', "")
    addLexTest(resultsTable, 'SmallScheme.lex_token("#B")', "")

    addParseTest(resultsTable, 'SmallScheme.tokenize("(hello-world!)")',
                 [SchemeTokenTypes.lparen, SchemeTokenTypes.id, SchemeTokenTypes.rparen])

    addParseTest(resultsTable, 'SmallScheme.tokenize("#((<test>) .!allo)")',
                 [SchemeTokenTypes.lvec, SchemeTokenTypes.lparen, SchemeTokenTypes.id, SchemeTokenTypes.rparen,
                  SchemeTokenTypes.dot, SchemeTokenTypes.id, SchemeTokenTypes.rparen])
}
