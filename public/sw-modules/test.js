function random50(){
    return Math.floor(Math.random() * 3); // 0 or 1
}

async function tempRandomAddUpdateStatuses(categories){
    let upIDs = [];
    for(let id in categories){
        if(random50()){
            upIDs.push(id)
        }
    }
    await sendMessage("", "update_LS", {keyName: "categories", ids:upIDs})
}