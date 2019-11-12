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
    let isValid = false
    if (Array.isArray(types)) {
        isValid = types.some(t => child instanceof t)
    } else {
        isValid = child instanceof types
    }
    if (!isValid)
        throw new Error(type.name+" cannot accept "+child.constructor.name)
}
function isTokenOfType(token, tokenTypes) {
    return tokenTypes.some(t => token.type == t)
}

function isSimpleExp(ast) {
    let isComplex = (ast instanceof AST_procCall) || (ast instanceof AST_lambda)
    return !isComplex
}

function validateSimpleExp(ast) {
    if (!isSimpleExp(ast)) {
        throw new Error("expecting simple exp for: "+ast.print())
    }
}

function primordialK() {
    let temp = AST_var.makeInternal("primordial")
    return new AST_lambda(new AST_formals([temp], false), false,
                          new AST_body(false, false, temp))
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
    static makeInternal(hint) {
        return new AST_var("|"+hint+"_"+Math.floor(Math.random()*9999))
    }
    print() { return this.val }
    toCPS(k) {
        return new AST_procCall(k, [], this)
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
    print() { return this.val ? "#t" : "#f" }
    toCPS(k) {
        return new AST_procCall(k, [], this)
    }
}
class AST_num {
    constructor(val) { this.val = val }
    static parse(tokens) {
        return false
    }
    print() { return this.val }
    toCPS(k) {
        return new AST_procCall(k, [], this)
    }
}
class AST_char {
    constructor(val) { this.val = val }
    static parse(tokens) {
        return false
    }
    print() { return this.val }
    toCPS(k) {
        return new AST_procCall(k, [], this)
    }
}
class AST_str {
    constructor(val) { this.val = val }
    static parse(tokens) {
        return false
    }
    print() { return this.val }
    toCPS(k) {
        return new AST_procCall(k, [], this)
    }
}
class AST_selfEval {
    static parse(tokens) {
        let res = (AST_bool.parse(tokens)
                   || AST_num.parse(tokens)
                   || AST_char.parse(tokens)
                   || AST_str.parse(tokens))
        return res
    }
}
class AST_quote { // todo
    static parse(tokens) { return false }
}

class AST_lit {
    static parse(tokens) {
        let res = AST_selfEval.parse(tokens) || AST_quote.parse(tokens)
        return res
    }
}

class AST_procCall {
    constructor(func, args, contArg) {
        // validateASTChild(AST_procCall, func, AST_exp)
        // args.every(arg => validateASTChild(AST_procCall, arg, AST_exp))
        // validate contArg is a lambda with only one arg
        this.func       = func
        this.args       = args
        this.contArg    = contArg
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
    print() {
        let str="("
        str += this.func.print()+" "
        this.args.forEach(a => str += a.print() + " ")
        if (this.contArg) str += "["+this.contArg.print()+"] "

        return str.slice(0,str.length-1) + ")"
    }
    toCPS(k) {
        if (!isSimpleExp(this.func)) {
            let funcKVar = AST_var.makeInternal("funcKont")
            let funcKont =
                new AST_lambda(new AST_formals([funcKVar], false), false,
                               new AST_body([], [],
                                            new AST_procCall(funcKVar, this.args).toCPS(k)))
            return this.func.toCPS(funcKont)
        } else {
            for (let i=0; i<this.args.length; ++i) {
                if (!isSimpleExp(this.args[i])) {
                    let argKVar = AST_var.makeInternal("argKont")
                    let argList = this.args.slice(0)
                    argList[i] = argKVar
                    let argKont =
                        new AST_lambda(new AST_formals([argKont], false), false,
                               new AST_body([], [],
                                            new AST_procCall(this.func, argList).toCPS(k)))
                    return this.args[i].toCPS(argKont)
                }
            }
            // if func and all vars are simple
            return new AST_procCall(this.func, this.args, k)
        }
    }
}

class AST_formals {
    constructor(vars, rest) {
        // if (vars) vars.every(v => validateASTChild(AST_formals, v, AST_var))
        // if (rest) validateASTChild(AST_formals, rest, AST_var)
        this.vars = vars
        this.rest = rest
    }
    static parse(tokens) {
        if (tokens.length == 0) return false
        let vars = []
        let rest = false
        let tokensLeft = tokens
        if (tokens[0].type == SchemeTokenTypes.lparen) {
            let tokensLeft = tokens.slice(1)
            while (tokensLeft !== false && tokensLeft.length > 0) {
                let ast = false
                if (ast = AST_var.parse(tokensLeft)) {
                    vars.push(ast.astNode)
                    tokensLeft = ast.tokensLeft
                } else if (tokensLeft[0].type == SchemeTokenTypes.dot
                           && vars.length > 0
                           && tokensLeft.length >= 3
                           && (ast = AST_var.parse([tokensLeft[1]]))
                           && tokensLeft[2].type == SchemeTokenTypes.rparen) {
                    return new ParseResult(new AST_formals(vars, ast.astNode),
                                           tokensLeft.slice(3))
                } else if (tokensLeft[0].type == SchemeTokenTypes.rparen) {
                    return new ParseResult(new AST_formals(vars, false),
                                           tokensLeft.slice(1))
                } else {
                    return false
                }
            }
            return false
        } else {
            let varAst = AST_var.parse(tokens)
            if (varAst) {
                return new ParseResult(new AST_formals(false, varAst.astNode),
                                       varAst.tokensLeft)
            } else {
                return false
            }
        }
    }
    print() {
        if (this.vars === false) return this.rest.print()
        let str = "("
        this.vars.forEach(v => str += v.print() + " ")
        if (this.rest !== false) str += ". "+this.rest.print()+" "
        return str.slice(0,str.length-1) + ")"
    }
}

class AST_definition {
    static parse(tokens) { return false } // todo
}

class AST_body {
    constructor(definitions, commands, body) {
        // if (definitions) definitions.every(d=>validateASTChild(AST_body, d, AST_definition))
        // if (commands) commands.every(c =>validateASTChild(AST_body, c, AST_exp))
        // validateASTChild(AST_body, body, AST_exp)
        this.definitions    = definitions
        this.commands       = commands
        this.body           = body
    }
    static parse(tokens) {
        let defs        = []
        let commands    = []
        let parseResult = false
        let tokensLeft  = tokens
        while (parseResult = AST_definition.parse(tokensLeft)) {
            defs.push(parseResult.astNode)
            tokensLeft = parseResult.tokensLeft
        }
        while (parseResult = AST_exp.parse(tokensLeft)) {
            commands.push(parseResult.astNode)
            tokensLeft = parseResult.tokensLeft
        }
        if (commands.length == 0) return false

        let bodyExp     = commands[commands.length-1]
        let bodyCmds    = commands.slice(0, commands.length-1)
        return new ParseResult(new AST_body(defs, bodyCmds, bodyExp), tokensLeft)
    }
    print() {
        let str = ""
        if (this.definitions !== false) this.definitions.forEach(d => str += d.print() + " ")
        if (this.commands !== false)    this.commands.forEach(c => str += c.print() + " ")
        str += this.body.print()
        return str
    }
    toCPS(k) {
        let cpsDefinitions = this.definitions // TODO
        // TODO? chain commands in function calls?
        return new AST_body(cpsDefinitions, this.commands, this.body.toCPS(k))
    }
}

class AST_lambda {
    constructor(formals, contVar, body) {
        // validateASTChild(AST_lambda, formals, AST_formals)
        // if (contVar) validateASTChild(AST_lambda, contVar, AST_var)
        // validateASTChild(AST_lambda, body, AST_body)
        this.formals    = formals
        this.contVar    = contVar
        this.body       = body
    }
    static parse(tokens) {
        if (tokens.length < 6)                          return false
        if (tokens[0].type != SchemeTokenTypes.lparen)  return false
        if (tokens[1].type != SchemeTokenTypes.id || tokens[1].text.toLowerCase() != "lambda") return false

        let formalsResult = AST_formals.parse(tokens.slice(2))
        if (formalsResult === false) return false

        let bodyResult = AST_body.parse(formalsResult.tokensLeft)
        if (bodyResult === false || bodyResult.tokensLeft.length == 0)  return false
        if (bodyResult.tokensLeft[0].type != SchemeTokenTypes.rparen)   return false

        return new ParseResult(new AST_lambda(formalsResult.astNode, false, bodyResult.astNode), bodyResult.tokensLeft.slice(1))
    }
    print() {
        let contVarStr = this.contVar ? " ["+this.contVar.print()+"]" : ""
        return "(lambda "+this.formals.print()+contVarStr+" "+this.body.print()+")"
    }
    toCPS(k) {
        let lambdaCont  = AST_var.makeInternal("lambdaK")
        let cpsLambda   = new AST_lambda(this.formals, lambdaCont,
                                         this.body.toCPS(lambdaCont))
        return new AST_procCall(k, [], cpsLambda)
    }
}

class AST_exp {
    static parse(tokens) {
        let res = (AST_var.parse(tokens)
                   || AST_lit.parse(tokens)
                   || AST_procCall.parse(tokens)
                   || AST_lambda.parse(tokens))
        return res
    }
}
