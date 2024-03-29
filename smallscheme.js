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

function SmallSchemeError(msg, file, line) {
    let error = new Error(msg, file, line)
    error.name = "SmallSchemeError"
    return error
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

const SchemeCharNames = {"space" : " ", "newline" : "\n"}

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
    static lex_charName(input) {
        for (let [name, chr] of Object.entries(SchemeCharNames)) {
            let l = name.length
            if (input.length >= l && input.slice(0, l).toLowerCase() == name)
                return [chr, input.slice(l)]
        }
        return false
    }
    static lex_char(input) {
        if (input.length < 3 || input[0] != "#" || input[1] != "\\") return false
        let inputRest = input.slice(2)
        let charNameRes = SmallScheme.lex_charName(inputRest)
        let chr = inputRest[0]
        if (charNameRes !== false) {
            chr = charNameRes[0]
            inputRest = charNameRes[1]
        }
        else {
            inputRest = inputRest.slice(1)
        }
        return [new SchemeToken(SchemeTokenTypes.character, chr), inputRest]
    }

    // ---- string lexing ----
    static lex_string(input) {
        if (input.length < 1 || input[0] != "\"") return false
        let strContent = ""
        let isEscaping = false
        for (let i=1; i<input.length; ++i) {
            if (input[i] == "\\") {
                if (!isEscaping)
                    isEscaping = true
                else {
                    strContent += "\\"
                    isEscaping = false
                }
            }
            else if (input[i] == "\"") {
                if (isEscaping) {
                    strContent += "\""
                    isEscaping = false
                } else {
                    return [new SchemeToken(SchemeTokenTypes.string, strContent), input.slice(i+1)]
                }
            } else {
                if (isEscaping)
                    return false
                strContent += input[i]
            }
        }
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

function EvalResult(newEnv, value) {
    this.env = newEnv
    this.val = value
}

function validateASTChild(type, child, types) {
    let isValid = false
    if (Array.isArray(types)) {
        isValid = types.some(t => child instanceof t)
    } else {
        isValid = child instanceof types
    }
    if (!isValid)
        throw new SmallSchemeError(type.name+" cannot accept "+child.constructor.name)
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
        throw new SmallSchemeError("expecting simple exp for: "+ast.print())
    }
}

function primordialK() {
    let valVar  = AST_var.makeInternal("primordialVal")
    let k = new AST_lambda(new AST_formals([valVar], false),
                           new AST_body(false, false, valVar))
    k.isPrimordial = true
    return k
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
    pprint() { return this.val }
    toCPS(k) {
        return new AST_procCall(k, [this])
    }
    eval(env) {
        let val = env.getValue(this.val)
        if (!val)
            throw new SmallSchemeError("undefined variable "+this.val)
        else
            return val
    }
    eqv(ast) { return ast instanceof AST_var && this.val == ast.val }
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
    pprint() { return this.print() }
    toCPS(k) {
        return new AST_procCall(k, [this])
    }
    eval(env) { return this }
    eqv(ast) { return ast instanceof AST_bool && this.val == ast.val }
}
class AST_num {
    constructor(val) { this.val = val }
    static parse(tokens) {
        return false
    }
    print() { return this.val }
    pprint() { return this.val }
    toCPS(k) {
        return new AST_procCall(k, [this])
    }
    eval(env) { return this }
    eqv(ast) { return ast instanceof AST_num && this.val == ast.val }
}
class AST_char {
    constructor(val) { this.val = val }
    static parse(tokens) {
        if (tokens.length > 0 && isTokenOfType(tokens[0], [SchemeTokenTypes.character])) {
            let ast = new AST_char(tokens[0].text)
            return new ParseResult(ast, tokens.slice(1))
        }
        return false
    }
    print() { return this.val }
    pprint() { return this.val }
    toCPS(k) {
        return new AST_procCall(k, [this])
    }
    eval(env) { return this }
    eqv(ast) { return ast instanceof AST_char && this.val == ast.val }
}
class AST_str {
    constructor(val) { this.val = val }
    static parse(tokens) {
        if (tokens.length > 0 && isTokenOfType(tokens[0], [SchemeTokenTypes.string])) {
            let ast = new AST_str(tokens[0].text)
            return new ParseResult(ast, tokens.slice(1))
        }
        return false
    }
    print() { return this.val }
    pprint() { return this.val }
    toCPS(k) {
        return new AST_procCall(k, [this])
    }
    eval(env) { return this }
    eqv(ast) { return ast instanceof AST_str && this.val == ast.val }
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
class AST_quote {
    constructor(datum) {
        this.datum = datum
    }
    static parse(tokens) {
        if (tokens.length > 1 && tokens[0].type == SchemeTokenTypes.quote) {
            let datumRes = AST_datum.parse(tokens.slice(1))
            if (datumRes === false) return false
            return new ParseResult(new AST_quote(datumRes.astNode), datumRes.tokensLeft)
        }
        else if (tokens.length < 4
                 || tokens[0].type != SchemeTokenTypes.lparen 
                 || tokens[1].type != SchemeTokenTypes.id
                 || tokens[1].text.toLowerCase() != "quote"){
            return false
        }
        let datumRes = AST_datum.parse(tokens.slice(2))
        if (!datumRes) return false
        if (datumRes.tokensLeft.length == 0 || datumRes.tokensLeft[0].type != SchemeTokenTypes.rparen)
            return false
        return new ParseResult(new AST_quote(datumRes.astNode), datumRes.tokensLeft.slice(1))
    }
    toCPS(k) { return new AST_procCall(k, [this]) }
    eval(env) { return this.datum }
    print() { return "'"+this.datum.print() }
    pprint() { return "'"+this.datum.pprint() }
    eqv(ast) { return ast instanceof AST_quote && this.datum.eqv(ast.datum) }
}

class AST_lit {
    static parse(tokens) {
        let res = AST_selfEval.parse(tokens) || AST_quote.parse(tokens)
        return res
    }
}

class AST_symbol {
    constructor(id) {
        this.id = id
    }
    static parse(tokens) {
        if (tokens.length == 0 || tokens[0].type != SchemeTokenTypes.id) return false
        return new ParseResult(new AST_symbol(tokens[0].text), tokens.slice(1))
    }
    toCPS(k) { return new AST_procCall(k, [this]) }
    eval(env) { return new AST_var(this.id).eval(env) }
    print() { return this.id }
    pprint() { return this.id }
    eqv(ast) { return ast instanceof AST_symbol && ast.id == this.id }
}

class AST_nil {
    constructor(){}
    eval(env) { return this }
    print() { return "nil" }
    pprint() { return "nil" }
    eqv(ast) { return ast instanceof AST_nil }
}

class AST_cons {
    constructor(car, cdr) {
        this.car = car
        this.cdr = cdr
    }
    static build(listElements, restElem) {
        let cdr = restElem ? restElem : new AST_nil()
        if (listElements.length == 0) return cdr
        for (let i=listElements.length-1; i>=0; --i) {
            cdr = new AST_cons(listElements[i], cdr)
        }
        return cdr
    }
    isList() {
        let elem        = this
        let initLoop    = true
        while(true) {
            if (!initLoop && elem === this) return true
            initLoop = false
            
            if (elem.cdr instanceof AST_nil) return true
            if (elem.cdr instanceof AST_cons) elem = elem.cdr
            else return false
        }
    }
    toCPS(k) { return new AST_procCall(k, [this]) }
    eval(env) { return this }
    print() { return "("+this.car.print()+" . "+this.cdr.print()+")" }
    pprint() {
        const isList = this.isList()
        if (!isList) {
            return "("+this.car.pprint()+" . "+this.cdr.pprint()+")"
        } else {
            let str = "("
            let elem = this
            let initLoop = true
            while(true) {
                if (!initLoop && elem === this) return str.slice(0,str.length-1)+")"
                initLoop = false
                str += elem.car.pprint()+" "
                if (elem.cdr instanceof AST_nil) return str.slice(0,str.length-1)+")"
                if (elem.cdr instanceof AST_cons) elem = elem.cdr
                else return "<unknown list format>"
            }            
        }
    }
    eqv(ast) {
        let thisNode = this
        let otherNode= ast
        let initLoop = true
        while(true) {
            if (!initLoop && thisNode === this) return true
            initLoop = false
            if (!(otherNode instanceof AST_cons)) return false
            if (!thisNode.car.eqv(otherNode.car)) return false
            if (thisNode.cdr instanceof AST_cons) {
                if (otherNode instanceof AST_cons) {
                    thisNode = thisNode.cdr
                    otherNode = otherNode.cdr
                } else return false
            } else {
                return thisNode.cdr.eqv(otherNode.cdr)
            }
        }
    }
}

class AST_datum {
    static simpleTypes() { return [AST_bool, AST_num, AST_char, AST_str, AST_symbol]}
    static parseSimple(tokens) {
        for (let t of AST_datum.simpleTypes()) {
            let res = t.parse(tokens)
            if (res) return res
        }
        return false
    }
    static abbrevPrefixTypes() { return [SchemeTokenTypes.quote,
                                         // SchemeTokenTypes.backquote,
                                         // SchemeTokenTypes.comma,
                                         // SchemeTokenTypes.splice
                                        ]}
    static parseAbbrev(tokens) {
        if (tokens.length < 2) return false
        for (let prefType of AST_datum.abbrevPrefixTypes()) {
            if (tokens[0].type == prefType) {
                let datumRes = AST_datum.parse(tokens.slice(1))
                if (!datumRes) return false
                return new ParseResult(new AST_quote(datumRes.astNode), datumRes.tokensLeft)
            }
        }
        return false
    }
    static parseList(tokens) {
        if (tokens.length < 2 || tokens[0].type != SchemeTokenTypes.lparen)
            return false
        
        let elements        = []
        let rest            = false
        let elemResult      = true
        let currentTokens   = tokens.slice(1)
        while (elemResult = AST_datum.parse(currentTokens)) {
            elements.push(elemResult.astNode)
            currentTokens = elemResult.tokensLeft
        }
        if (currentTokens.lenght < 1) return false
        if (currentTokens[0].type == SchemeTokenTypes.dot) {
            let restResult = AST_datum.parse(currentTokens.slice(1))
            if (restResult === false) return false
            rest = restResult.astNode
            currentTokens = restResult.tokensLeft
        }
        if (currentTokens.length < 1 || currentTokens[0].type != SchemeTokenTypes.rparen) {
            return false
        } else {
            let consAst = AST_cons.build(elements, rest)
            return new ParseResult(consAst, currentTokens.slice(1))
        }
    }
    static parseVec(tokens) {
        return false
    }
    static parseCompound(tokens) {
        return AST_datum.parseList(tokens)
            || AST_datum.parseVec(tokens)
    }
    static parse(tokens) {
        return AST_datum.parseSimple(tokens)
            || AST_datum.parseAbbrev(tokens)
            || AST_datum.parseCompound(tokens)
    }
}

class AST_procCall {
    constructor(func, args) {
        // validateASTChild(AST_procCall, func, AST_exp)
        // args.every(arg => validateASTChild(AST_procCall, arg, AST_exp))
        this.func       = func
        this.args       = args
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
            if (operandsTokens[0].type == SchemeTokenTypes.rparen) {
                operandsTokens = operandsTokens.slice(1)
                break
            }
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

        return str.slice(0,str.length-1) + ")"
    }
    toCPS(k) {
        let funcKVar = AST_var.makeInternal("funcKvar")
        let argKvars = this.args.map(arg => AST_var.makeInternal("argKvar"))
        let fKont = new AST_lambda(new AST_formals([funcKVar], false),
                                   new AST_body([], [],
                                                new AST_procCall(funcKVar, [k].concat(argKvars))))
        fKont.isCPS = true
        
        let currentKbody = this.func.toCPS(fKont)
        for (let i=0; i<this.args.length; ++i) {
            let argKvar = argKvars[i]
            let argK    = new AST_lambda(new AST_formals([argKvar], false),
                                         new AST_body([], [], currentKbody))
            argK.isCPS = true
            currentKbody = this.args[i].toCPS(argK)
        }
        return currentKbody
    }
    eval(env) {
        if (env.isCPSEval() && this['isTopLevel'] === undefined)
            return {env: env, exp: this} // trampoline descent

        let func        = this.func.eval(env)
        let args        = this.args.map(arg => arg.eval(env))

        if (!(func instanceof AST_lambda)) 
            throw new SmallSchemeError("Invalid procedure call, invalid operator: "+func.print())

        if (func.formals.rest) {
            if (func.formals.vars.length > args.length)
                throw new SmallSchemeError("Invalid procedure call, invalid operands count for: "+this.print())
        }
        else if (func.formals.vars && func.formals.vars.length != args.length)
            throw new SmallSchemeError("Invalid procedure call, invalid operands count for: "+this.print())
        else if (func.formals.vars === false && args.length > 0)
            throw new SmallSchemeError("Invalid procedure call, invalid operands count for: "+this.print())

        let closureInstance = func.closure
        for (let i=0; i<func.formals.vars.length; ++i)
            closureInstance.addBinding(func.formals.vars[i].val, args[i])
        
        if (func.body.commands)
            func.body.commands.forEach(c => c.eval(closureInstance))

        let val = func.body.body.eval(closureInstance)
        return val
    }
    eqv(ast) {
        if (!(ast instanceof AST_procCall))                 return false
        if (!this.func.eqv(ast.func))                       return false
        if (this.args.length != ast.args.length)            return false
        for (let i=0; i<this.args.length; ++i) {
            if (!this.args[i].eqv(ast.args[i]))             return false
        }
        return true
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
        if (this.vars === false) {
            if (this.rest) return this.rest.print()
            else return "()"
        }
        
        let str = "("
        this.vars.forEach(v => str += v.print() + " ")
        if (this.rest) str += ". "+this.rest.print()+" "
        if (str.length == 1) str += " "
        return str.slice(0,str.length-1) + ")"
    }
    eqv(ast) {
        if (!(ast instanceof AST_formals))          return false
        if (this.vars.length != ast.vars.length)    return false
        for (let i=0; i<this.vars.length; ++i){
            if (!this.vars[i].eqv(ast.vars[i]))     return false
        }
        return true
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
        return new AST_body(cpsDefinitions, this.commands, this.body.toCPS(k))
    }
    eqv(ast) {
        if (!(ast instanceof AST_body)) return false
        if (Boolean(this.commands) != Boolean(ast.commands) ||
            this.commands.length != ast.commands.length) return false
        if (this.commands) {
            for (let i =0; i<this.commands.length; ++i) {
                if (!this.commands[i].eqv(ast.commands[i])) return false
            }
        }
        return this.body.eqv(ast.body)
    }
}

class AST_lambda {
    constructor(formals, body) {
        // validateASTChild(AST_lambda, formals, AST_formals)
        // if (contVar) validateASTChild(AST_lambda, contVar, AST_var)
        // validateASTChild(AST_lambda, body, AST_body)
        this.formals        = formals
        this.body           = body
        this.closure        = new SmallSchemeEnv()
        this.isPrimordial   = false
        this.isCPS          = false
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

        return new ParseResult(new AST_lambda(formalsResult.astNode, bodyResult.astNode), bodyResult.tokensLeft.slice(1))
    }
    print() {
        let formalsStr = this.formals.print()
        if (this.formals.length == 0) formalsStr = "()"
        return "(lambda "+formalsStr+" "+this.body.print()+")"
    }
    pprint() {
        return "<procedure>"
    }
    toCPS(k) {
        if (this.isCPS !== false) return this // already cps
        
        let lambdaCont  = AST_var.makeInternal("lambdaK")
        let cpsLambda   = new AST_lambda(new AST_formals([lambdaCont].concat(this.formals.vars),
                                                         this.formals.rest),
                                         this.body.toCPS(lambdaCont))
        cpsLambda.isCPS = true
        return new AST_procCall(k, [cpsLambda])
    }
    eval(env) {
        this.closure = (this.isCPS || this.isPrimordial) ? env : env.deepCopy()

        // todo add definitions to closure
        //if (func.body.definitions)  func.body.definitions.forEach(def => def.eval(scopeEnv))

        // todo ensure all free variable are contained in this.closure
        return this
    }
    eqv(ast) {
        return ast instanceof AST_lambda
            && this.formals.eqv(ast.formals)
            && this.body.eqv(ast.body)
    }
}

class AST_void {
    constructor() {}
    print() { return "<void>" }
    pprint() { return "<void>" }
    toCPS(k) { return new AST_procCall(k, [this]) }
    eval(env) { return this }
    eqv(ast) { return ast instanceof AST_void }
}

class AST_if {
    constructor(test, consequent, alternate) {
        this.test       = test
        this.consequent = consequent
        this.alternate  = alternate
    }
    static parse(tokens) {
        if (tokens.length < 5)                          return false
        if (tokens[0].type != SchemeTokenTypes.lparen)  return false
        if (tokens[1].type != SchemeTokenTypes.id)      return false
        if (tokens[1].text.toLowerCase() != "if")       return false
        let testAst = AST_exp.parse(tokens.slice(2))
        if (testAst === false)                          return false
        let conseqAst = AST_exp.parse(testAst.tokensLeft)
        if (conseqAst === false)                        return false
        if (conseqAst.tokensLeft == 0)                  return false
        let altAst = AST_exp.parse(conseqAst.tokensLeft)
        if (altAst === false) {
            if (conseqAst.tokensLeft[0].type == SchemeTokenTypes.rparen) {
                return new ParseResult(new AST_if(testAst.astNode, conseqAst.astNode, false),
                                       conseqAst.tokensLeft.slice(1))
            } else return false
        } else {
            if (altAst.tokensLeft.length > 0 && altAst.tokensLeft[0].type == SchemeTokenTypes.rparen) {
                return new ParseResult(new AST_if(testAst.astNode, conseqAst.astNode, altAst.astNode),
                                       altAst.tokensLeft.slice(1))
            } else return false
        }
    }
    print() { return "(if "+this.test.print()+" "+this.consequent.print()
              + (this.alternate ? " "+this.alternate.print() : "") + ")"
    }
    pprint() { return this.print() }
    toCPS(k) {
        if (isSimpleExp(this.test))
            return new AST_if(this.test, this.consequent.toCPS(k), this.alternate ? this.alternate.toCPS(k) : false)
        else {
            let testKvar    = AST_var.makeInternal("testKvar")
            let testCont    = new AST_lambda(new AST_formals([testKvar], false),
                                             new AST_body([], [], 
                                                          new AST_if(testKvar,
                                                                     this.consequent.toCPS(k),
                                                                     this.alternate ? this.alternate.toCPS(k) : false)))
            testCont.isCPS = true
            return this.test.toCPS(testCont)
        }
    }
    eval(env) {
        let testVal = this.test.eval(env)
        let res = new AST_void()
        let isFalse = testVal.eqv(new AST_bool(false))
        if (isFalse) {
            if (this.alternate) {
                res = this.alternate.eval(env)
            } 
        } else {
            res = this.consequent.eval(env)
        }
        return res
    }
    eqv(ast) {
        return ast instanceof AST_if
            && this.test.eqv(ast.test)
            && this.consequent.eqv(ast.consequent)
            && Boolean(this.alternate) == Boolean(ast.alternate)
            && (!Boolean(this.alternate) || this.alternate.eqv(ast.alternate))
    }
}

class AST_set {
    constructor(variable, exp) {
        this.variable = variable
        this.exp = exp
    }
    static parse(tokens) {
        if (tokens.length < 5)                          return false
        if (tokens[0].type != SchemeTokenTypes.lparen)  return false
        if (tokens[1].type != SchemeTokenTypes.id)      return false
        if (tokens[1].text.toLowerCase() != "set!")     return false
        let varRes = AST_var.parse(tokens.slice(2))
        if (!varRes)                                    return false
        let expRes = AST_exp.parse(varRes.tokensLeft)
        if (!expRes)                                    return false
        if (expRes.tokensLeft.length < 1)               return false
        if (expRes.tokensLeft[0].type != SchemeTokenTypes.rparen)   return false
        return new ParseResult(new AST_set(varRes.astNode, expRes.astNode), expRes.tokensLeft.slice(1))
    }
    toCPS(k) {
        let expKvar = AST_var.makeInternal("setexpKvar")
        let expK    = new AST_lambda(new AST_formals([expKvar], false),
                                     new AST_body([], [],
                                                  new AST_procCall(k, [new AST_set(this.variable, expKvar)])))
        return this.exp.toCPS(expK)
    }
    eval(env) {
        let value = this.exp.eval(env)
        env.addBinding(this.variable.val, value)
        return new AST_void()
    }
    print() { "(set! "+this.variable.print()+" "+this.exp.print()+")" }
    pprint() { "(set! "+this.variable.pprint()+" "+this.exp.pprint()+")" }
    eqv(ast) {
        return ast instanceof AST_set
            && this.variable.eqv(ast.var)
            && this.exp.eqv(ast.exp)
    }
}

class AST_exp {
    static types() { return [AST_var, AST_lit, AST_procCall, AST_lambda, AST_if, AST_set]}
    static parse(tokens) {
        for (let t of AST_exp.types()) {
            let res = t.parse(tokens)
            if (res) return res
        }
        return false
    }
    static validate(node) {
        return AST_exp.types().some(t => t.validate(tokens))
    }
}

//-----------------------------------------------------------------------------
// evaluation and trampoline

class SmallSchemeEnv {
    constructor(parent = false) {
        this.bindings   = []
        this.parentEnv  = parent
        this.isCPS      = false
    }
    findBinding(variable) {
        for (let binding of this.bindings) {
            if (binding[0] == variable) {
                return binding
            }
        }
        return false
    }
    addBinding(variable, val) {
        let existingBinding = this.findBinding(variable)
        if (existingBinding) {
            existingBinding[1] = val
        } else {
            this.bindings.push([variable, val])
        }
    }
    getValue(variable) {
        let currentEnv = this
        while(currentEnv) {
            let existingBinding = currentEnv.findBinding(variable)
            if (existingBinding) return existingBinding[1]
            else currentEnv = currentEnv.parentEnv
        }
        return false
    }
    deepCopy() {
        let newEnv = new SmallSchemeEnv()
        let currentEnv = this
        while(currentEnv) {
            for (let [v,val] of currentEnv.bindings) {
                let vFound = newEnv.bindings.some(b => b[0] == v)
                if (vFound) continue
                newEnv.addBinding(v, val)
            }
            currentEnv = currentEnv.parentEnv
        }
        return newEnv
    }
    isCPSEval() {
        let currentEnv = this
        while(currentEnv) {
            if (currentEnv.isCPS) return true
            currentEnv = currentEnv.parentEnv
        }
        return false
    }
}

function smallSchemeParse(exp) {
    if (exp == "") return new AST_void()
    
    let tokens = SmallScheme.tokenize(exp)
    if (tokens === false)
        throw new SmallSchemeError("Could not lex expression: "+exp+" (lexing not fully implemented yet)")
    let parseResult = AST_exp.parse(tokens)
    if (parseResult === false)
        throw new SmallSchemeError("Could not parse expression: "+exp+" (parsing not fully implemented yet)")
    return parseResult.astNode
}

function smallSchemeParseDatum(exp) {
    if (exp == "") return new AST_void()
    
    let tokens = SmallScheme.tokenize(exp)
    if (tokens === false)
        throw new SmallSchemeError("Could not lex expression: "+exp+" (lexing not fully implemented yet)")
    let parseResult = AST_datum.parse(tokens)
    if (parseResult === false)
        throw new SmallSchemeError("Could not parse expression: "+exp+" (parsing not fully implemented yet)")
    return parseResult.astNode
}

function makeCallCC() {
    let kvar = AST_var.makeInternal("kvar")
    let kfun = AST_var.makeInternal("kfun")
    let callcc = new AST_lambda(new AST_formals([kvar, kfun], false),
                                new AST_body([], [],
                                             new AST_procCall(kfun, [kvar, kvar])))
    callcc.isCPS = true
    return callcc
}

function smallSchemeEnv() {
    let env = new SmallSchemeEnv()
    env.addBinding("nil", new AST_nil())
    env.addBinding("call/cc", makeCallCC())
    return env
}

function smallSchemeEvalAST(ast, env=smallSchemeEnv()) {
    let result = false
    do {
        ast.isTopLevel = true
        result = ast.eval(env)
        if (result['env'] !== undefined && result['exp'] !== undefined) {
            env = result.env
            ast = result.exp
        } else {
            ast = result
        }
    } while (ast instanceof AST_procCall)
    return ast
}

function smallSchemeEval(exp, env=smallSchemeEnv()) {
    return smallSchemeEvalAST(smallSchemeParse(exp), env)
}

function smallSchemeCPSEval(exp, env=smallSchemeEnv()) {
    env.isCPS = true
    return smallSchemeEvalAST(smallSchemeParse(exp).toCPS(primordialK()), env)
}
