

[
    {$match:{}},
    {$group:{_id:"$buyer",total:{$sum:"$prize"}}}
]