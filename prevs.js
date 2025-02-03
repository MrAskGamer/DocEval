function splitter(value) {
    if (value == 'Feedback') {
        return Array.from(document.querySelectorAll('p')).filter(pa => pa.innerText.includes(value))
    } else if (value == 'Batches') {
        return Array.from(document.querySelectorAll('p')).filter(pa => pa.innerText.includes(value)).map(e => e.innerText.split(value)[1].replace(':', '').replace(' ', ''))
    }
    else {
        return Array.from(document.querySelectorAll('p')).filter(pa => pa.innerText.includes(value)).map(e => e.innerText.split(value)[1].replace(/^[^a-zA-Z]*/, ''))
    }
}

function stringy(params) {
    params.forEach(e => {
        e.batches = JSON.stringify(e.batches)
        e.choices = JSON.stringify(e.choices)
        e.feedback_images = JSON.stringify(e.feedback_images)
        e.attachments = JSON.stringify(e.attachments)
    })
    return params
}


let output = []

let sourke = 'Previous'

let questions = document.querySelectorAll('[aria-level="1"]')
let choices = [...new Set([...document.querySelectorAll('[aria-level="2"]')].map(e => e.parentElement))]
let ogQ = splitter('original_question')
let ogA = splitter('original_answer')
let tags = splitter('Tag')
let batches = splitter('Batches').map(e=> e.split(', '))
let feedbacks = splitter('Feedback')

// let parentCheck = [questions, choices, ogQ, ogA, tags].map(arr => ({
//     type: `questions/choices/ogQ/ogA`,
//     html: arr,
//     length: arr.length
// }))
let arrays = {
  ogQ: ogQ,
  questions: questions,
  choices: choices,
  ogA: ogA,
  tags: tags,
  batches: batches,
  feedbacks: feedbacks,
};

// Map through the arrays object and create the desired structure
let parentCheck = Object.entries(arrays).map(([name, arr]) => ({
  type: name,   // This will use the key from the object, which is the variable name as a string
  html: arr,
  length: arr.length
}));

let lengthCheck = parentCheck.map(arr => arr.length)

if (lengthCheck.every(e => e == Math.max(...lengthCheck))) {
    for (let i = 0; i < lengthCheck[0]; i++) {
        let qTxt = questions[i].innerText
        let qParentNext = questions[i].parentElement.nextElementSibling
        let attachment = qParentNext.querySelector('img') && !qParentNext.querySelector('[aria-level]') ? [qParentNext.querySelector('img').src] : []
        let qChoices = choices[i].innerText.split('\n\n')
        let qCorrect = choices[i].querySelector('[role]').parentElement.innerText
        let qOgQ = ogQ[i]
        let qOgA = ogA[i]
        let tempTag = tags[i]
        let qBatches = batches[i]
        
        let discipline = tempTag.split(' ')?.[0]
        const n = tempTag.split("").findIndex(str => str !== " " && !isNaN(Number(str)));
        let instructor = tempTag.slice(0, -(tempTag.split("").length - n)).trim().split(" ").slice(1).join(" ")
        let index = tempTag.split(instructor + ' ')?.[1]?.split?.(' ')?.[0]
        let lecture = tempTag.split(index + ' ')?.[1]

        let fdImg = []
        let fdTxt = ""
        if (feedbacks[i].innerText.replace('Feedback:', '')) fdTxt = feedbacks[i].innerText.replace('Feedback:', '')
        if (feedbacks[i].querySelector('img')) feedbacks[i].querySelectorAll('img').forEach(e => fdImg.push(e.src))
        
        let feedLoop = feedbacks[i].nextElementSibling
        while (!feedLoop.querySelector('[aria-level]')) {
            if (feedLoop.querySelector('img')) {
                feedLoop.querySelectorAll('img').forEach(e => fdImg.push(e.src))
            }
        
            if (feedLoop.innerText) {
                fdTxt += feedLoop.innerText
            }

            if (feedLoop.nextElementSibling == undefined) break
            feedLoop = feedLoop.nextElementSibling
        }
        
    

        output.push({
            source: sourke, //don't forget to edit value
            batches: qBatches,
            type: "MCQ",
            text: qTxt,
            choices: qChoices,
            correct_choice: qCorrect,
            original_question: qOgQ,
            original_answer: qOgA,
            discipline: discipline,
            instructor: instructor,
            matching_index: "", //manual
            lecture: lecture,
            index: index,
            feedback_text: fdTxt, //DONT FORGET
            feedback_images: fdImg, //DONT FORGET
            attachments: attachment, //img, //DONT FORGET
            week: index?.split('.')[0]
        })
    }
} else {
    console.log('Please edit the document for better result\nCtrl+F the missing part (add space or remove : check anything or even s')
    console.log(parentCheck)
}

console.log(stringy(output))
