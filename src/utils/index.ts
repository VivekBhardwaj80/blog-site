const genUsername = ():string =>{
    const usernamePrefix = 'user-'
    const randomChars =  Math.random().toString(36).substring(2, 8) + Date.now().toString(36)
    const username = usernamePrefix + randomChars

    return username
}

const genSlug = (title:string):string=>{
    const slug = title.toLowerCase().replace(/[^a-z0-9]\s-/g,'').replace(/\s+/g,'-').replace(/-+/g,'-')
    const randomChars = Math.random().toString(36).slice(2)
    const uniqueSlug = `${slug}-${randomChars}}`
    return uniqueSlug
}

export {genUsername,genSlug}
