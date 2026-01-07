const genUsername = ():string =>{
    const usernamePrefix = 'user-'
    const randomChars =  Math.random().toString(36).substring(2, 8) + Date.now().toString(36)
    const username = usernamePrefix + randomChars

    return username
}

export default genUsername