// this script deal with the output to the calender page

async function createCalender() {

    // !!! used a coding tutorial to create a template !!!
    // Coding A Calender App In Plain JavaScript. youtu.be/m9OSBJaQTlM?si=rN6a9p833cPSyiiO.
    // I used some ideas like manipulating the date strings and filling the first few days from the
    // previous month, but after a bit I turned away and finished the rest to fit my projects needs
    // there is a cut off from where I stopped using their idea, even the bulk of the middle isnt
    // exactly the same, but it is similar

    // get information about the current date
    currentDate = new Date();
    month = currentDate.getMonth();
    year = currentDate.getFullYear();

    // get the number of days in the current and previous months
    // the number of days in the next month are not needed since
    // those days will be added as needed (only 1 to 6 possible)
    daysInMonth = new Date(year, month + 1, 0).getDate();
    daysInPreviousMonth = new Date(year, month, 0).getDate();

    // get the weekdays for the first and last days of the current month
    // used to determine how many days needed from previous/next month
    firstDay = new Date(year, month, 1);
    weekday = firstDay.toLocaleDateString('en-us', {
        weekday: 'long',
    });
    weekdayLastDay = new Date(year, month + 1, 0);
    lastDayWeekday = weekdayLastDay.toLocaleDateString('en-us', {
        weekday: 'long',
    });

    // define the days of the week
    dayList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // get the number of days needed to fill in the calender month from
    // the previous and next month
    prevMonthDays = dayList.indexOf(weekday);
    nextMonthDays = 6 - dayList.indexOf(lastDayWeekday);

    // this date string gets dislayed by current day
    currentDateString = currentDate.toLocaleDateString('en-us', {
        weekday: 'long',
        month: 'numeric',
        day: 'numeric',
    });

    // this date string gets sent to the flask app and decoded for SQL database
    currentDateString2 = currentDate.toLocaleDateString('en-us', {
        year: 'numeric',
        day: 'numeric',
        month: 'numeric',
    });

    // define calender container
    calenderContainer = document.getElementById('calender');

    // define current day container and fill the date
    currentDayContainer = document.getElementById('currentDay');
    currentDayContainer.innerText = `${currentDateString}`;

    // define an event container for the current day and request the
    // longer event descriptions to fill it
    currentEventContainer = document.createElement('div');
    await getEventLongString(currentDateString2, currentEventContainer);

    // append the events to the current day container
    currentDayContainer.appendChild(currentEventContainer);

    // create the day containers for the current calender month
    for(i = 1; i <= prevMonthDays + daysInMonth; i++) {
        dayContainer = document.createElement('div');

        // if the index is past the number of days from the previous month
        // needed to fill first week then create a day container
        if (i > prevMonthDays) {

            // get the date for the day
            containerDayValue = i - prevMonthDays;
            containerDateValue = new Date(year, month, containerDayValue);
            containerDateString = containerDateValue.toLocaleDateString('en-us', {
                year: 'numeric',
                day: 'numeric',
                month: 'numeric',
            });

            // add info to container
            dayContainer.classList.add('day');
            dayContainer.innerText = containerDayValue;
        } else {
            // if not in the range of the months days then the container will be
            // from the previous month

            // get the date for the day
            containerDayValue = daysInPreviousMonth - prevMonthDays + i;
            containerDateValue = new Date(year, month - 1, containerDayValue);
            containerDateString = containerDateValue.toLocaleDateString('en-us', {
                year: 'numeric',
                day: 'numeric',
                month: 'numeric',
            });

            // add info to the container
            dayContainer.classList.add('extraDay');
            dayContainer.innerText = daysInPreviousMonth - prevMonthDays + i;
        }

        // append the container to the calender
        calenderContainer.appendChild(dayContainer);

        // !!! ended where I followed along !!!

        // define an events container for the day container
        eventContainer = document.createElement('div');
        eventContainer.classList.add('dayEvents');

        // request the events for the day
        await getEventNameString(containerDateString, eventContainer)

        // append the events container to the day container
        dayContainer.appendChild(eventContainer);
    }

    // add days to the end of the calender month to fill in last week if needed
    if (nextMonthDays > 0) {
        for(i = 0; i < nextMonthDays; i++) {

            dayContainer = document.createElement('div');

            // get date for the day
            containerDayValue = i + 1;
            containerDateValue = new Date(year, month + 1, containerDayValue);
            containerDateString = containerDateValue.toLocaleDateString('en-us', {
                year: 'numeric',
                day: 'numeric',
                month: 'numeric',
            });

            // add info to the container
            dayContainer.classList.add('extraDay');
            dayContainer.innerText = containerDayValue;

            // apend the day container to the calender
            calenderContainer.appendChild(dayContainer);

            // create the event container and add info
            eventContainer = document.createElement('div');
            eventContainer.classList.add('dayEvents');

            // request the events for the day
            await getEventNameString(containerDateString, eventContainer)

            // append the event container to the day
            dayContainer.appendChild(eventContainer);
        }
    }

}

async function createMedia() {

    // define media container
    mediaContainer = document.getElementById('media');

    // request the media
    mediaList = (await getMediaData()).split("||");

    // create containers for each media
    for (i = 0; i < (await mediaList).length; i++) {
        // create the container for the media and add info
        mediaDataContainer = document.createElement('div');
        mediaDataContainer.classList.add('mediaContainer');

        // if the media is an image
        if ((await mediaList[i]).charAt(6) == "/") {
            // create an image element
            mediaImage = document.createElement('img');
            mediaImage.src = (await mediaList[i]);

            // append the image container to the media data container
            mediaDataContainer.appendChild(mediaImage);
        }
        // if the media is text
        else {
            // set text into the media data container
            mediaDataContainer.innerText = (await mediaList[i]);
        }

        // append the media data container to the media container
        mediaContainer.appendChild(mediaDataContainer);
    }
}

// the event name getters
async function getEventName(eventDate) {
    return fetch('/return_event_name', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ date: eventDate })
    });
}

async function getEventNameString(eventDate, eventContainer) {
    const eventName = await getEventName(eventDate);
    eventContainer.innerText = JSON.parse(JSON.stringify(await eventName.json())).events;
}

// the event long description getters
async function getEventLong(eventDate) {
    return fetch('/return_event_long', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ date: eventDate })
    });
}

async function getEventLongString(eventDate, eventContainer) {
    const eventLong = await getEventLong(eventDate);
    eventContainer.innerText = JSON.parse(JSON.stringify(await eventLong.json())).events;
}

// the media getters
async function getMedia() {
    return fetch('/return_media', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

async function getMediaData() {
    const mediaData = await getMedia();
    return JSON.parse(JSON.stringify(await mediaData.json())).media;
}

async function getMediaImage(file_path) {
    const imageData = await fetch(`/return_media_image?path=${file_path}`);
    return URL.createObjectUrl(await imageData.blob())
}

// finally create the media and calender sections
createMedia();
createCalender();
