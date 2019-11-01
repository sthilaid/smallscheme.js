const SchemeTokenTypes = {
    id          : 0,
    bool        : 1,
    num         : 2,
    character   : 3,
    string      : 4,
    lparen      : 5,
    rparen      : 6,
    lvec        : 7,
    quote       : 9,
    backquote   : 10,
    comma       : 11,
    splice      : 12,
    dot         : 13,
}

const SchemeSpecialLetters = "!$%&*/:<>?^_~"
const SchemeSpecialSubsequent = "+-.@"
const SchemeExpressionKeyword = ["quote", "lambda", "if", "set!", "begin",
                                 "cond", "and", "or", "case", "let", "let*",
                                 "letrec", "do", "delay", "quasiquote"]
const SchemeSyntaxicKeyword =
      SchemeExpressionKeyword.concat(["else", "=>", "define","unquote",
                                      "unquote-splicing"])

class SchemeToken {
    constructor(type, text) {
        this.type = type
        this.text = text
    }
}

class SmallScheme {
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
        if (out = SmallScheme.lex_whitespace(input))    return out
        if (out = SmallScheme.lex_comment(input))       return out
        else                                            return false
    }
    static lex_intertokenSpace(input) {
        let out = SmallScheme.lex_atmosphere(input)
        if (!out) return input

        let res = out
        while (res = SmallScheme.lex_atmosphere(res)) {
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
        if (out = SmallScheme.lex_letter(input))            return out
        if (out = SmallScheme.lex_specialInitial(input))    return out
        else                                                return false
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
        if (out = SmallScheme.lex_initial(input))               return out
        if (out = SmallScheme.lex_digit(input))                 return out
        if (out = SmallScheme.lex_specialSubsequent(input))     return out
        else                                                    return false
    }
    static lex_identifier(input) {
        let out = SmallScheme.lex_initial(input)
        if (!out) {
            out = SmallScheme.lex_peculiarSubsequent(input)
        } else {
            let res = out
            while (res = SmallScheme.lex_subsequent(res)) {
                out = res
            }
        }
        if (out) {
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
    
    // ---- tokenization ----
    static tokenize(input) {
        
    }
}
