const SchemeTokenTypes = {
    lparen      : "lparen",
    rparen      : "rparen",
    lvec        : "lvec",
    quote       : "quote",
    backquote   : "backquote",
    comma       : "comma",
    splice      : "splice",
    dot         : "dot",
    id          : "id",
    bool        : "bool",
    num         : "num",
    character   : "character",
    string      : "string",
}

const SchemeSpecialLetters = "!$%&*/:<>?^_~"
const SchemeSpecialSubsequent = "+-.@"
const SchemeExpressionKeyword = ["quote", "lambda", "if", "set!", "begin",
                                 "cond", "and", "or", "case", "let", "let*",
                                 "letrec", "do", "delay", "quasiquote"]
const SchemeSyntaxicKeyword =
      SchemeExpressionKeyword.concat(["else", "=>", "define","unquote",
                                      "unquote-splicing"])

const SchemeSimpleTokens = ["(" , ")" , "#(" , "'" , "`" , ",@" , ","  , "."]

class SchemeToken {
    constructor(type, text) {
        this.type = type
        this.text = text
    }
    toString() {
        return "SchemeToken("+this.type+", "+this.text+")"
    }
}

class SmallScheme {
    //-----------------------------------------------------------------------------
    // Toknization
    
    // ---- atmosphere lexing ----
    static lex_whitespace(input) {
        if (input.length == 0)                      return false
        if (input[0] == " " || input[0] == "\t")    return input.substr(1)
        else                                        return false
    }
    static lex_comment(input) {
        if (input.length == 0)  return false
        if (input[0] != ";")    return false
        let i=0
        for (i=0; i<input.length; ++i) {
            if (input[i] == "\n")
                break
        }
        return input.substr(i+1)
    }
    static lex_atmosphere(input) {
        let out = false
        if ((out = SmallScheme.lex_whitespace(input)) !== false)    return out
        if ((out = SmallScheme.lex_comment(input)) !== false)       return out
        else                                                        return false
    }
    static lex_intertokenSpace(input) {
        let out = input
        let res = input
        while ((res = SmallScheme.lex_atmosphere(res)) !== false) {
            out = res
        }
        return out
    }
    // ---- identifier lexing ----
    static lex_letter(input) {
        let aCode = 97  //"a".charCodeAt(0)
        let zCoxe = 122 //"z".charCodeAt(0)
        if (input.length == 0)                              return false
        let firstCode = input[0].toLowerCase().charCodeAt(0)
        if (firstCode >= aCode && firstCode <= zCoxe)       return input.substr(1)
        else                                                return false
    }
    static lex_specialInitial(input) {
        if (input.length == 0)                              return false
        let isSpecial = letter => letter == input[0]
        if (SchemeSpecialLetters.split("").some(isSpecial)) return input.substr(1)
        else                                                return false
    }
    static lex_initial(input) {
        let out = false
        if ((out = SmallScheme.lex_letter(input)) !== false)            return out
        if ((out = SmallScheme.lex_specialInitial(input)) !== false)    return out
        else                                                            return false
    }
    static lex_digit(input) {
        if (input.length == 0)  return false
        let firstInput  = input.charCodeAt(0)
        let isDigit     = firstInput >= 48 && firstInput <= 57 // 0: 48, 9: 57
        if (isDigit)            return input.substr(1)
        else                    return false
    }
    static lex_specialSubsequent(input) {
        if (input.length == 0)                                  return false
        let isSpecial = letter => letter == input[0]
        if (SchemeSpecialSubsequent.split("").some(isSpecial))  return input.substr(1)
        else                                                    return false
    }
    static lex_peculiarSubsequent(input) {
        if (input.length == 0)                                  return false
        if (input[0] == "+")                                    return input.substr(1)
        if (input[0] == "-")                                    return input.substr(1)
        if (input.length < 3)                                   return false
        if (input.substr(0,3) == "...")                         return input.substr(3)
        else                                                    return false
    }
    static lex_subsequent(input) {
        let out = false
        if ((out = SmallScheme.lex_initial(input)) !== false)           return out
        if ((out = SmallScheme.lex_digit(input)) !== false)             return out
        if ((out = SmallScheme.lex_specialSubsequent(input)) !== false) return out
        else                                                            return false
    }
    static lex_identifier(input) {
        let out = SmallScheme.lex_initial(input)
        if (out === false) {
            out = SmallScheme.lex_peculiarSubsequent(input)
        } else {
            let res = out
            while ((res = SmallScheme.lex_subsequent(res)) !== false) {
                out = res
            }
        }
        if (out !== false) {
            let idStr = input.substr(0, (input.length - out.length))
            return [new SchemeToken(SchemeTokenTypes.id, idStr), out]
        } else {
            return false
        }
    }
    // ---- keyworkd lexing ----
    // static lex_keyword(input) {
    //     let inputKeyword = false
    //     SchemeSyntaxicKeyword.some(function (key) {
    //         let isKeyword = key == input.substr(0, key.length)
    //         if (isKeyword)
    //             inputKeyword = key
    //         return isKeyword
    //     })
    //     if (inputKeyword)   return input.substr(inputKeyword.length)
    //     else                return false
    // }

    // ---- bool lexing ----
    static lex_bool(input) {
        if (input.length < 2)                           return false
        let inputStart = input.substr(0, 2).toLowerCase()
        if (inputStart == "#t" || inputStart == "#f")
            return [new SchemeToken(SchemeTokenTypes.bool, input.substr(0, 2)),
                    input.substr(2)]
        else
            return false
    }

    // ---- number lexing ----
    static lex_number(input) {
        return false
    }

    // ---- char lexing ----
    static lex_char(input) {
        return false
    }

    // ---- char lexing ----
    static lex_string(input) {
        return false
    }

    // ---- simple token lexing ----
    static lex_simple(input) {
        let token       = false
        let tokenIndex  = 0
        for (let i=0; i<SchemeSimpleTokens.length; ++i) {
            if (input.startsWith(SchemeSimpleTokens[i])) {
                token = SchemeSimpleTokens[i]
                tokenIndex = i
                break
            }
        }
        if (token) {
            let tokenType = Object.values(SchemeTokenTypes)[tokenIndex]
            return [new SchemeToken(tokenType, input.substr(0, token.length)), input.substr(token.length)]
        }
        else {
            return false
        }
    }
    
    // ---- tokenization ----
    static lex_token(input) {
        return SmallScheme.lex_simple(input)
            || SmallScheme.lex_identifier(input)
            || SmallScheme.lex_bool(input)
            || SmallScheme.lex_number(input)
            || SmallScheme.lex_char(input)
            || SmallScheme.lex_string(input)
    }
    
    static tokenize(input) {
        let tokens = []
        let token = false
        while (true) {
            input = SmallScheme.lex_intertokenSpace(input)
            if (token = SmallScheme.lex_token(input)) {
                tokens.push(token[0])
                input = token[1]
            } else {
                break
            }
        }
        return tokens
    }
}

//-----------------------------------------------------------------------------
// Parsing

function ParseResult(astNode, tokensLeft) {
    this.astNode    = astNode
    this.tokensLeft = tokensLeft
}

function validateASTChild(type, child, types) {
    let isValid = types.some(t => child instanceof t)
    if (!isValid)
        throw new Error(type.name+" cannot accept "+child.constructor.name)
}
function isTokenOfType(token, tokenTypes) {
    return tokenTypes.some(t => token.type == t)
}

class AST_var {
    constructor(val) { this.val = val }
    static parse(tokens) {
        if (tokens.length < 1)                      return false
        if (tokens[0].type !== SchemeTokenTypes.id) return false 
        let isValid = SchemeSyntaxicKeyword.every(k => tokens[0].text != k)
        if (!isValid) return false
        else return new ParseResult(new AST_var(tokens[0].text), tokens.slice(1))
    }
}

class AST_bool {
    constructor(val) { this.val = val }
    static parse(tokens) {
        if (tokens.length > 0 && isTokenOfType(tokens[0], [SchemeTokenTypes.bool])) {
            let ast = new AST_bool(tokens[0].text.toLowerCase() == "#t")
            return new ParseResult(ast, tokens.slice(1))
        }
        else
            return false
    }
}
class AST_num {
    constructor(val) { this.val = val }
    static parse(tokens) {
        return false
    }
}
class AST_char {
    constructor(val) { this.val = val }
    static parse(tokens) {
        return false
    }
}
class AST_str {
    constructor(val) { this.val = val }
    static parse(tokens) {
        return false
    }
}
class AST_selfEval {
    constructor(val) {
        validateASTChild(AST_selfEval, val, [AST_bool, AST_num, AST_char, AST_str])
        this.val = val
    }
    static parse(tokens) {
        let res = false
        if (res = AST_bool.parse(tokens))
            return new ParseResult(new AST_selfEval(res.astNode), res.tokensLeft)
        else if (res = AST_num.parse(tokens))
            return new ParseResult(new AST_selfEval(res.astNode), res.tokensLeft)
        else if (res = AST_char.parse(tokens))
            return new ParseResult(new AST_selfEval(res.astNode), res.tokensLeft)
        else if (res = AST_str.parse(tokens))
            return new ParseResult(new AST_selfEval(res.astNode), res.tokensLeft)
        else
            return false
    }
}
class AST_quote { // todo
    static parse(tokens) { return false }
}

class AST_lit {
    constructor(val) {
        validateASTChild(AST_lit, val, [AST_selfEval, AST_quote])
        this.val = val
    }
    static parse(tokens) {
        let res = false
        if (res = AST_selfEval.parse(tokens))
            return new ParseResult(new AST_lit(res.astNode), res.tokensLeft)
        else if (res = AST_quote.parse(tokens))
            return new ParseResult(new AST_lit(res.astNode), res.tokensLeft)
        else
            return false
    }
}

class AST_procCall {
    constructor(func, args) {
        validateASTChild(AST_procCall, func, [AST_exp])
        args.every(arg => validateASTChild(AST_procCall, arg, [AST_exp]))
        this.func = func
        this.args = args
    }
    static parse(tokens) {
        if (tokens.length < 3)                          return false
        if (tokens[0].type != SchemeTokenTypes.lparen)  return false
        let operatorRes = AST_exp.parse(tokens.slice(1))
        if (operatorRes === false)                      return false
        let operands        = []
        let operandsTokens  = operatorRes.tokensLeft
        let operandsRes     = false
        while(operandsTokens.length > 0) {
            let operandsRes = false
            if (operandsTokens[0].type == SchemeTokenTypes.rparen)
                break
            else if (operandsRes = AST_exp.parse(operandsTokens)) {
                operands.push(operandsRes.astNode)
                operandsTokens = operandsRes.tokensLeft
            } else {
                return false
            }
        }
        return new ParseResult(new AST_procCall(operatorRes.astNode, operands),
                               operandsTokens)
    }
}

class AST_formals {
    constructor(vars, rest) {
        vars.every(v => validateASTChild(AST_formals, v, AST_var))
        if (rest) validateASTChild(AST_formals, rest, AST_var)
        this.vars = vars
        this.rest = rest
    }
    static parse(tokens) {
        if (tokens.length == 0) return false
        let vars = []
        let rest = false
        let tokensLeft = []
        if (tokens[0].type == SchemeTokenTypes.lparen) {
        } else {
            let varAst = AST_var.parse(tokens)
            if (varAst) {
                vars = [varAst.astNode]
                tokensLeft = varAst.tokensLeft
            }
        }
    }
}

class AST_body {
}

class AST_lambda {
    constructor(formals, body) {
        validateASTChild(AST_lambda, formals, [AST_formals])
        validateASTChild(AST_lambda, body, [AST_body])
        this.formals = formals
        this.body = body
    }
}

class AST_exp {
    constructor(exp) {
        validateASTChild(AST_exp, exp, [AST_var, AST_lit, AST_procCall])
        this.exp = exp
    }
    static parse(tokens) {
        let res = false
        if ((res = AST_var.parse(tokens))
            || (res = AST_lit.parse(tokens))
            || (res = AST_procCall.parse(tokens)))
            return new ParseResult(new AST_exp(res.astNode), res.tokensLeft)
        else
            return false
    }
}
