
let lexTestCount = 0
let lexTestPassCount = 0
let parseTestCount = 0
let parseTestPassCount = 0
let evalTestCount = 0
let evalTestPassCount = 0

function addTest(resultsTable, input, rest, isGood, comment, id) {
    let testRow = resultsTable.insertRow(isGood ? -1 : 1)
    testRow.className = "test-row"
    
    let testIdCell  = testRow.insertCell(-1)
    testIdCell.innerText = "Test #"+id

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
    
    if (isGood) ++lexTestPassCount
    addTest(resultsTable, input, rest, isGood, comment, lexTestCount++)
}
function addTokenTest(resultsTable, input, expectedResult) {
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
    if (isGood) ++lexTestPassCount
    addTest(resultsTable, input, "", isGood, comment, lexTestCount++)
}

function addParseTest(resultsTable, input,
                      test = (r => r !== false), failMsg = "could not parse input") {
    let val     = eval(input)
    let isGood  = test(val)
    let comment = isGood ? "" : failMsg
    if (isGood) parseTestPassCount++
    addTest(resultsTable, input, "", isGood, comment, parseTestCount++)
}
function addNegativeParseTest(resultsTable, input, test = (r => r !== false)) {
    addParseTest(resultsTable, input, (r => r === false), "Should not be parseable")
}
function addParsePrintTest(resultsTable, input, expected) {
    let val     = eval(input)
    let isGood  = val == expected
    let comment = isGood ? "" : "Unexpected result, expecting "+expected
    addTest(resultsTable, input, val, isGood, comment) 
}

function addEvalTest(resultsTable, expression, expected, isExpectedDatum = false) {
    let ast         = smallSchemeParse(expression)
    let val         = smallSchemeEvalAST(ast)
    let expectedAST = isExpectedDatum ? smallSchemeParseDatum(expected) : smallSchemeParse(expected)
    let isGood      = val.eqv(expectedAST)
    let comment     = isGood ? "" : "Unexpected value, expecting "+expected
    if (isGood) ++evalTestPassCount
    addTest(resultsTable, expression, val.print(), isGood, comment, evalTestCount++)

    if (!isExpectedDatum)
    {
        let cpsExp          = ast.toCPS(primordialK())
        let cpsVal          = smallSchemeEvalAST(cpsExp)
        let cpsExpectedAST  = smallSchemeEvalAST(expectedAST.toCPS(primordialK()))
        // console.log(cpsVal)
        // console.log(cpsExpectedAST)
        let cpsIsGood       = cpsVal.eqv(cpsExpectedAST)
        let cpsComment      = cpsIsGood ? "" : "Unexpected value, expecting "+expected
        if (cpsIsGood) ++evalTestPassCount
        addTest(resultsTable, expression, cpsVal.print(), cpsIsGood, "[CPS] "+cpsComment, evalTestCount++) 
    }
}

let lexTestTable = document.getElementById("lex-unit-tests-table")
if (lexTestTable) {
    addLexTest(lexTestTable, 'SmallScheme.lex_comment("; adsasffdjjjj   ffff ;;  fff\\nhello")', "hello")
    addLexTest(lexTestTable, 'SmallScheme.lex_atmosphere(" hello")', "hello")
    addLexTest(lexTestTable, 'SmallScheme.lex_atmosphere("\thello")', "hello")
    addLexTest(lexTestTable, 'SmallScheme.lex_atmosphere(";ddddd ; \\nhello")', "hello")
    addLexTest(lexTestTable, 'SmallScheme.lex_atmosphere("- hello")', false)
    addLexTest(lexTestTable, 'SmallScheme.lex_intertokenSpace("\t\t \t  ;blabla\\nhello")', "hello")
    addLexTest(lexTestTable, 'SmallScheme.lex_intertokenSpace("hello")', "hello")
    addLexTest(lexTestTable, 'SmallScheme.lex_letter("Allo")', "llo")
    addLexTest(lexTestTable, 'SmallScheme.lex_letter("allo")', "llo")
    addLexTest(lexTestTable, 'SmallScheme.lex_letter("Zllo")', "llo")
    addLexTest(lexTestTable, 'SmallScheme.lex_letter("zllo")', "llo")
    addLexTest(lexTestTable, 'SmallScheme.lex_letter("yllo")', "llo")
    addLexTest(lexTestTable, 'SmallScheme.lex_letter("?llo")', false)
    addLexTest(lexTestTable, 'SmallScheme.lex_specialInitial("?llo")', "llo")
    addLexTest(lexTestTable, 'SmallScheme.lex_specialInitial("Allo")', false)
    addLexTest(lexTestTable, 'SmallScheme.lex_specialInitial("&llo")', "llo")
    addLexTest(lexTestTable, 'SmallScheme.lex_initial("&llo")', "llo")
    addLexTest(lexTestTable, 'SmallScheme.lex_initial("allo")', "llo")
    addLexTest(lexTestTable, 'SmallScheme.lex_initial("?llo")', "llo")
    addLexTest(lexTestTable, 'SmallScheme.lex_initial("1llo")', false)
    addLexTest(lexTestTable, 'SmallScheme.lex_digit("1llo")', "llo")
    addLexTest(lexTestTable, 'SmallScheme.lex_digit("0llo")', "llo")
    addLexTest(lexTestTable, 'SmallScheme.lex_digit("94llo")', "4llo")
    addLexTest(lexTestTable, 'SmallScheme.lex_digit("hell0")', false)
    addLexTest(lexTestTable, 'SmallScheme.lex_specialSubsequent("@llo")', "llo")
    addLexTest(lexTestTable, 'SmallScheme.lex_specialSubsequent(".llo")', "llo")
    addLexTest(lexTestTable, 'SmallScheme.lex_specialSubsequent("+llo")', "llo")
    addLexTest(lexTestTable, 'SmallScheme.lex_specialSubsequent("-llo")', "llo")
    addLexTest(lexTestTable, 'SmallScheme.lex_specialSubsequent("allo")', false)
    addLexTest(lexTestTable, 'SmallScheme.lex_specialSubsequent("4llo")', false)
    addLexTest(lexTestTable, 'SmallScheme.lex_peculiarSubsequent("+llo")', "llo")
    addLexTest(lexTestTable, 'SmallScheme.lex_peculiarSubsequent("-llo")', "llo")
    addLexTest(lexTestTable, 'SmallScheme.lex_peculiarSubsequent("...llo")', "llo")
    addLexTest(lexTestTable, 'SmallScheme.lex_peculiarSubsequent("..llo")', false)
    addLexTest(lexTestTable, 'SmallScheme.lex_peculiarSubsequent(".llo")', false)
    addLexTest(lexTestTable, 'SmallScheme.lex_peculiarSubsequent("4llo")', false)
    addLexTest(lexTestTable, 'SmallScheme.lex_subsequent("4llo")', "llo")
    addLexTest(lexTestTable, 'SmallScheme.lex_subsequent("...allo")', "..allo")
    addLexTest(lexTestTable, 'SmallScheme.lex_identifier("...allo rest")', "allo rest")
    addLexTest(lexTestTable, 'SmallScheme.lex_identifier("!!allo rest")', " rest")
    addLexTest(lexTestTable, 'SmallScheme.lex_identifier("<allo> rest")', " rest")
    addLexTest(lexTestTable, 'SmallScheme.lex_identifier("+ rest")', " rest")
    addLexTest(lexTestTable, 'SmallScheme.lex_identifier("+allo rest")', "allo rest")
    addLexTest(lexTestTable, 'SmallScheme.lex_identifier("-allo rest")', "allo rest")
    addLexTest(lexTestTable, 'SmallScheme.lex_identifier("!+allo rest")', " rest")
    addLexTest(lexTestTable, 'SmallScheme.lex_identifier("allo+allo rest")', " rest")
    addLexTest(lexTestTable, 'SmallScheme.lex_identifier("@allo rest")', false)
    addLexTest(lexTestTable, 'SmallScheme.lex_identifier(".allo rest")', false)
    addLexTest(lexTestTable, 'SmallScheme.lex_identifier("allo.allo rest")', " rest")
    addLexTest(lexTestTable, 'SmallScheme.lex_identifier("allo@allo rest")', " rest")
    addLexTest(lexTestTable, 'SmallScheme.lex_identifier("123allo rest")', false)
    addLexTest(lexTestTable, 'SmallScheme.lex_identifier("allo123 rest")', " rest")
    // addLexTest(lexTestTable, 'SmallScheme.lex_keyword("elserest")', "rest")
    // addLexTest(lexTestTable, 'SmallScheme.lex_keyword("quoterest")', "rest")
    // addLexTest(lexTestTable, 'SmallScheme.lex_keyword("=>rest")', "rest")
    // addLexTest(lexTestTable, 'SmallScheme.lex_keyword("quasiquot")', false)
    // addLexTest(lexTestTable, 'SmallScheme.lex_keyword("quasiquote")', "")
    addLexTest(lexTestTable, 'SmallScheme.lex_bool("#tallo")', "allo")
    addLexTest(lexTestTable, 'SmallScheme.lex_bool("#fallo")', "allo")
    addLexTest(lexTestTable, 'SmallScheme.lex_bool("#Fallo")', "allo")
    addLexTest(lexTestTable, 'SmallScheme.lex_bool("#Jallo")', false)
    addLexTest(lexTestTable, 'SmallScheme.lex_simple("(allo")', "allo")
    addLexTest(lexTestTable, 'SmallScheme.lex_simple(")allo")', "allo")
    addLexTest(lexTestTable, 'SmallScheme.lex_simple("#(allo")', "allo")
    addLexTest(lexTestTable, 'SmallScheme.lex_simple("\'allo")', "allo")
    addLexTest(lexTestTable, 'SmallScheme.lex_simple("`allo")', "allo")
    addLexTest(lexTestTable, 'SmallScheme.lex_simple(",allo")', "allo")
    addLexTest(lexTestTable, 'SmallScheme.lex_simple(",@allo")', "allo")
    addLexTest(lexTestTable, 'SmallScheme.lex_simple(".allo")', "allo")
    addLexTest(lexTestTable, 'SmallScheme.lex_simple("<allo")', false)
    addLexTest(lexTestTable, 'SmallScheme.lex_simple("$allo")', false)
    addLexTest(lexTestTable, 'SmallScheme.lex_token("$allo")', "")
    addLexTest(lexTestTable, 'SmallScheme.lex_token("(allo")', "allo")
    addLexTest(lexTestTable, 'SmallScheme.lex_token(".allo")', "allo")
    addLexTest(lexTestTable, 'SmallScheme.lex_token("a.allo")', "")
    addLexTest(lexTestTable, 'SmallScheme.lex_token("#B")', "")
    addLexTest(lexTestTable, 'SmallScheme.lex_charName("spaCEee")', "ee")
    addLexTest(lexTestTable, 'SmallScheme.lex_charName("newLINE")', "")
    addLexTest(lexTestTable, 'SmallScheme.lex_char("#\\\\a")', "")
    addLexTest(lexTestTable, 'SmallScheme.lex_char("#\\\\!")', "")
    addLexTest(lexTestTable, 'SmallScheme.lex_char("#\\\\~")', "")
    addLexTest(lexTestTable, 'SmallScheme.lex_char("#\\\\123")', "23")
    addLexTest(lexTestTable, 'SmallScheme.lex_string("\\\"allo\\\"123")', "123")
    addLexTest(lexTestTable, 'SmallScheme.lex_string("\\\"this is \\\\\\\"a\\\\\\\" string\\\"123")', "123")
    addLexTest(lexTestTable, 'SmallScheme.lex_string("\\\"this is a char #\\\\\\\\a in a string\\\"123")', "123")

    addTokenTest(lexTestTable, 'SmallScheme.tokenize("(hello-world!)")',
                 [SchemeTokenTypes.lparen, SchemeTokenTypes.id, SchemeTokenTypes.rparen])

    addTokenTest(lexTestTable, 'SmallScheme.tokenize("#((<test>) .!allo)")',
                 [SchemeTokenTypes.lvec, SchemeTokenTypes.lparen, SchemeTokenTypes.id, SchemeTokenTypes.rparen,
                  SchemeTokenTypes.dot, SchemeTokenTypes.id, SchemeTokenTypes.rparen])
    }
let parseTestTable = document.getElementById("parse-unit-tests-table")
if (parseTestTable) {
    addParseTest(parseTestTable, 'AST_var.parse(SmallScheme.tokenize("allo"))')
    addParseTest(parseTestTable, 'AST_var.parse(SmallScheme.tokenize("!allo"))')
    addParseTest(parseTestTable, 'AST_lit.parse(SmallScheme.tokenize("#f"))')
    addParseTest(parseTestTable, 'AST_lit.parse(SmallScheme.tokenize("#T"))')
    addParseTest(parseTestTable, 'AST_procCall.parse(SmallScheme.tokenize("(f)"))')
    addParseTest(parseTestTable, 'AST_procCall.parse(SmallScheme.tokenize("(f #t #b)"))')
    addParseTest(parseTestTable, 'AST_procCall.parse(SmallScheme.tokenize("(f a b c) e f"))')
    addNegativeParseTest(parseTestTable, 'AST_procCall.parse(SmallScheme.tokenize("()"))')
    addParseTest(parseTestTable, 'AST_formals.parse(SmallScheme.tokenize("var"))')
    addParseTest(parseTestTable, 'AST_formals.parse(SmallScheme.tokenize("(var)"))')
    addParseTest(parseTestTable, 'AST_formals.parse(SmallScheme.tokenize("(v1 v2 v3)"))')
    addParseTest(parseTestTable, 'AST_formals.parse(SmallScheme.tokenize("(v1 v2 . r)"))')
    addNegativeParseTest(parseTestTable, 'AST_formals.parse(SmallScheme.tokenize("(v1 v2 . r no)"))')
    addNegativeParseTest(parseTestTable, 'AST_formals.parse(SmallScheme.tokenize("( . r no)"))')
    addParseTest(parseTestTable, 'AST_body.parse(SmallScheme.tokenize("v1 v2)"))')
    addParseTest(parseTestTable, 'AST_lambda.parse(SmallScheme.tokenize("(lambda (x y z) v1 v2)"))')
    addParseTest(parseTestTable, 'AST_lambda.parse(SmallScheme.tokenize("(lambda (x y . r) (v))"))')
    addParseTest(parseTestTable, 'AST_lambda.parse(SmallScheme.tokenize("(lambda a b (v))"))')
    addNegativeParseTest(parseTestTable, 'AST_lambda.parse(SmallScheme.tokenize("(lambda (x y . r v) (v))"))')
    addNegativeParseTest(parseTestTable, 'AST_lambda.parse(SmallScheme.tokenize("(lambda x . a)"))')
    addParseTest(parseTestTable, 'AST_exp.parse(SmallScheme.tokenize("(if #t good bad)"))')
    addParseTest(parseTestTable, 'AST_exp.parse(SmallScheme.tokenize("(if #t good)"))')
    addParseTest(parseTestTable, 'AST_exp.parse(SmallScheme.tokenize("(if (f x) good)"))')
    addParseTest(parseTestTable, 'AST_exp.parse(SmallScheme.tokenize("#T"))')
    addParseTest(parseTestTable, 'AST_exp.parse(SmallScheme.tokenize("(f)"))')
    addParseTest(parseTestTable, 'AST_exp.parse(SmallScheme.tokenize("(f #f !notHello)"))')
    addParseTest(parseTestTable, 'AST_datum.parse(SmallScheme.tokenize("(a b c)"))')
    addParseTest(parseTestTable, 'AST_datum.parse(SmallScheme.tokenize("(a b c . d)"))')
    addParseTest(parseTestTable, 'AST_datum.parse(SmallScheme.tokenize("sym"))')
    addParseTest(parseTestTable, 'AST_datum.parse(SmallScheme.tokenize("#f"))')

    addParsePrintTest(parseTestTable,
                      'AST_exp.parse(SmallScheme.tokenize("((lambda (x . r) #t))")).astNode.print()',
                     "((lambda (x . r) #t))")
}

let evalTestTable = document.getElementById("eval-unit-tests-table")
if (evalTestTable) {
    addEvalTest(evalTestTable, "#t", "#t")
    addEvalTest(evalTestTable, "(lambda (x . r) x)", "(lambda (x . r) x)")
    addEvalTest(evalTestTable, "((lambda (x y) x) #t #f)", "#t")
    addEvalTest(evalTestTable, "((lambda (x y) y) #t #f)", "#f")
    addEvalTest(evalTestTable, "((lambda (x y) (lambda (f) x)) #t #f)", "(lambda (f) x)")
    addEvalTest(evalTestTable, "(((lambda (x y) (lambda (f) x)) #t #f) #f)", "#t")
    addEvalTest(evalTestTable, "((lambda (x y) (lambda (f) (f x y))) #t #f)", "(lambda (f) (x y))")
    addEvalTest(evalTestTable, "(((lambda (x y) (lambda (f) (f x y))) #t #f) (lambda (x y) x))", "#t")
    addEvalTest(evalTestTable, "(((lambda (x) (lambda () x)) #t))", "#t")
    addEvalTest(evalTestTable, "(if #t (lambda (x) x) #f)", "(lambda (x) x)")
    addEvalTest(evalTestTable, "(if #f (lambda (x) x) #f)", "#f")
    addEvalTest(evalTestTable, "(if ((lambda (x) x) #t) #f)", "#f")
    addEvalTest(evalTestTable, "(if ((lambda (x) x) #f) #f)", "") // testing void
    addEvalTest(evalTestTable, "((lambda (x) (if x #t #f)) (lambda (x) x))", "#t")
    addEvalTest(evalTestTable, "((lambda (x) (if x #t #f)) #f)", "#f")
    addEvalTest(evalTestTable, "\"hello\"", "\"hello\"")
    addEvalTest(evalTestTable, "((lambda (x) \"hello\") #t)", "\"hello\"")
    addEvalTest(evalTestTable, "((lambda (x y) y) #t #\\y)", "#\\y")
    addEvalTest(evalTestTable, "'(a b c)", "(a b c)", true)
    addEvalTest(evalTestTable, "'a", "a", true)
    addEvalTest(evalTestTable, "'#t", "#t", true)
    addEvalTest(evalTestTable, "(quote (a b c . d))", "(a b c . d)", true)
}


function toggleDisplayElement(element, isShown) {
    if (!element) return
    element.style.display = isShown ? "block" : "none"
}

function addResult(table, text, count, passCount, testElement) {
    let row                     = table.insertRow(-1)
    let typeCell                = row.insertCell(-1)
    typeCell.innerText          = text
    let countCell               = row.insertCell(-1)
    countCell.innerText         = count
    let successCountCell        = row.insertCell(-1)
    successCountCell.innerText  = passCount
    successCountCell.style.color= (passCount == count ) ? "green" : "red"
    let displayCell             = row.insertCell(-1)
    if (testElement) {
        let displayCheckBox         = document.createElement("input")
        displayCheckBox.type        = "checkbox"
        displayCheckBox.checked     = false
        displayCheckBox.addEventListener("input", evt => toggleDisplayElement(testElement, displayCheckBox.checked))
        displayCell.appendChild(displayCheckBox)
    }

    toggleDisplayElement(testElement, false)
}

let resultTable = document.getElementById("test-results-table")
if (resultTable) {
    let lexTestsDiv = document.getElementById("lex-tests")
    addResult(resultTable, "Lexing unit tests", lexTestCount, lexTestPassCount, lexTestsDiv)

    let parseTestsDiv = document.getElementById("parse-tests")
    addResult(resultTable, "Parsing unit tests", parseTestCount, parseTestPassCount, parseTestsDiv)

    let evalTestsDiv = document.getElementById("eval-tests")
    addResult(resultTable, "Evaluation unit tests", evalTestCount, evalTestPassCount, evalTestsDiv)

    const testCount     = lexTestCount+parseTestCount+evalTestCount
    const testPassCount = lexTestPassCount+parseTestPassCount+evalTestPassCount
    addResult(resultTable, "Total", testCount, testPassCount, undefined)
}
