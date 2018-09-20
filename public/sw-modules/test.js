function random50(){
    return Math.floor(Math.random() * 3); // 0 or 1
}

async function tempRandomAddUpdateStatuses(categories){
    let itemsUpdated = 0;
    for(let id in categories){
        if(random50()){
            categories[id]["isUpdated"] = 1;
            itemsUpdated++;
        }
    }
    categories["updatedElementsQuantity"] = itemsUpdated;
    return categories
}