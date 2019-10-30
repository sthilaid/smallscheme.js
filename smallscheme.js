const SchemeToken = {
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

class SmallScheme {
    // ---- atmosphere parsing ----
    static parse_whitespace(input) {
        if (input.length == 0)                      return false
        if (input[0] == " " || input[0] == "\t")    return input.substr(1)
        else                                        return false
    }
    static parse_comment(input) {
        if (input.length == 0)  return false
        if (input[0] != ";")    return false
        let i=0
        for (i=0; i<input.length; ++i) {
            if (input[i] == "\n")
                break
        }
        return input.substr(i+1)
    }
    static parse_atmosphere(input) {
        let out = false
        if (out = SmallScheme.parse_whitespace(input))  return out
        if (out = SmallScheme.parse_comment(input))     return out
        else                                            return false
    }
    static parse_intertokenSpace(input) {
        let out = SmallScheme.parse_atmosphere(input)
        if (!out) return input

        let res = out
        while (res = SmallScheme.parse_atmosphere(res)) {
            out = res
        }
        return out
    }
    // ---- identifier parsing ----
    static parse_letter(input) {
        let aCode = 97  //"a".charCodeAt(0)
        let zCoxe = 122 //"z".charCodeAt(0)
        if (input.length == 0)                          return false
        let firstCode = input[0].toLowerCase().charCodeAt(0)
        if (firstCode >= aCode && firstCode <= zCoxe)   return input.substr(1)
        else                                            return false
    }
    static parse_specialInitial(input) {
        if (input.length == 0)                              return false
        let isSpecial = letter => letter == input[0]
        if (SchemeSpecialLetters.split("").some(isSpecial)) return input.substr(1)
        else                                                return false
    }
    static parse_initial(input) {
        let out = false
        if (out = SmallScheme.parse_letter(input))          return out
        if (out = SmallScheme.parse_specialInitial(input))  return out
        else                                                return false
    }
    
    // ---- tokenization ----
    static tokenize(input) {
        
    }
}
