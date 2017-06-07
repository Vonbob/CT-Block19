var month = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

var currentDate,
    selectedMonth,
    selectedYear,
    selectedDay,
    monthIndex; // YYYY.MM format - for indexing month data in localStorage

var monthDaysCount, //number of days in selected month
    monthFirstDay; //first day of the week in selected month

var selectedDayTD; //selected table cell 

var dayContentVisible = false;

var monthDataObject; //all month data loaded from localStorage for selected month



/* creating month calendar */
//structure in DOM
var createCalendarTab = function () {
    var calTab = $("table.calendar");
    var i, j;
    for (i = 0; i < 6; i++) {
        var tr = $("<tr></tr>");
        for (j = 0; j < 7; j++) {
            tr.append($("<td></td>"));
        }
        tr.appendTo(calTab);
    }
};

// loading month data from localStorage
var loadMonthData = function () {
    var value = localStorage.getItem(monthIndex);
    if (!value) {
        monthDataObject = null;
        return;
    }
    monthDataObject = JSON.parse(value);
};

//get number of days in selected month and first day of the week in selected month
var getMonthDaysInfo = function () {
    monthDaysCount = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    monthFirstDay = new Date(selectedYear, selectedMonth, 1).getDay(); //sunday - 0, monday - 1
};

//putting data in the DOM 
var fillCalendar = function () {
    var daysTD = $("table.calendar").find("td");

    //finding TD for the first day in the month
    var tdIndex = monthFirstDay + 7;
    var day = 1;

    while (day <= monthDaysCount) {
        var dayText = day + " <img src='images/activities.png' alt='' />";

        //check if data object for current month has array with activities for particular day
        //if yes put the icon inside td
        if (monthDataObject && monthDataObject[day] && monthDataObject[day].length > 0) {
            daysTD.eq(tdIndex).addClass("act");
        }

        //put day number inside td and associate day number with it
        daysTD.eq(tdIndex).html(dayText).data("day", day).addClass("day");

        day += 1;
        tdIndex += 1;
    }
};

//mark td with current day
var pointCurrentDay = function () {
    if ((selectedMonth == currentDate.getMonth()) && (selectedYear == currentDate.getFullYear())) {  
        var daysTD = $("table.calendar").find("td.day");
        daysTD.eq(new Date().getDate() - 1).addClass("current-day");
    }
};

//remove all content and classes from calendar td cells 
var clearCalendar = function () {
    var daysTD = $("table.calendar").find("tr:not(.days-of-week)").find("td");
    daysTD.empty();
    daysTD.removeClass();
}

//after first page load and refreshing website
var loadDefaultCalendar = function () {

    createCalendarTab();
    
    currentDate = new Date();
    selectedMonth = currentDate.getMonth();
    selectedYear = currentDate.getFullYear();
    monthIndex = selectedYear + "." + selectedMonth;
    $("p.month-name").text(month[selectedMonth] + " " + selectedYear);
    
    loadMonthData();
    getMonthDaysInfo();
    fillCalendar();
    pointCurrentDay();
};

//changing month
var prevMonth = function () {
    if (selectedMonth === 0) {
        selectedMonth = 11;
        selectedYear -= 1;
    }
    else {
        selectedMonth -= 1;
    }
};

var nextMonth = function () {
    if (selectedMonth === 11) {
        selectedMonth = 0;
        selectedYear += 1;
    }
    else {
        selectedMonth += 1;
    }
};

//loading particular month depending which navigation button was pressed
var changeMonth = function (event) {
    clearCalendar();
    if (event.data.direction) {
        if (event.data.direction === "prev") {
            prevMonth();
        }
        else if (event.data.direction === "next") {
            nextMonth();
        }
    }
    
    monthIndex = selectedYear + "." + selectedMonth;
    $("p.month-name").text(month[selectedMonth] + " " + selectedYear);

    loadMonthData();
    getMonthDaysInfo();
    fillCalendar();
    pointCurrentDay();
};

//showing activities for selected day
var showDayContent = function (event) {
    selectedDayTD = $(event.target);
    
    event.stopPropagation();

    //checks if there is place to put day-window below clicked point
    var top;
    var left = event.pageX - 180;
    if (event.pageY + 200 > $(window).height()) {
        top = event.pageY - 200;
        $("#day-content").removeClass("arrow-up");
        $("#day-content").addClass("arrow-down");
    }
    else {
        top = event.pageY;
        $("#day-content").removeClass("arrow-down");
        $("#day-content").addClass("arrow-up");
    }

    //checks if there are any activities loaded from localStorage for selected day
    //add them to day-window
    selectedDay = selectedDayTD.data("day");
    $(".day-activities").empty();
    if (monthDataObject && monthDataObject[selectedDay]) {
        var activities = monthDataObject[selectedDay];
        for (var i = 0; i < activities.length; ++i) {
            var activityContainer = $("<li></li>");
            $("<p></p>", { "text": activities[i], "contenteditable": "true" }).data("activity", i).appendTo(activityContainer);
            $("<img />", { "src": "images/delete.png", "title": "delete" }).addClass("delete-activity").appendTo(activityContainer);
            $("<img />", { "src": "images/save.png", "title": "save" }).addClass("save-activity").appendTo(activityContainer);
            activityContainer.appendTo($(".day-activities"));
        }
    }

    $("#day-content").css({ "left": left, "top": top });
    $("#day-content").find("p.day-info").text(selectedDay + " " + month[selectedMonth] + " " + selectedYear);
    $("#day-content").show();

    dayContentVisible = true;
};

//hides day-window when user clicks: anywhere on the page outside of the calendar, close icon on day window panel
var hideDayContent = function () {
    if (!dayContentVisible)
        return;

    $("#day-content").hide();
    dayContentVisible = false;
};

//creating new activity for selected day and saving it in localStorage
var createActivity = function () {
    var activity = $("#new-activity-content").val().trim();
    if (activity === "")
        return;

    //checks if there is data for current month, if not creates new data object
    if (!monthDataObject) {
        monthDataObject = {};
        monthDataObject[selectedDay] = [];
    }

    //checks if there is data for selected day, if not creates new table for selected day
    if (!monthDataObject[selectedDay]) {
        monthDataObject[selectedDay] = [];
    }

    //adds new user activity to data object
    var actIndex = monthDataObject[selectedDay].length;
    monthDataObject[selectedDay][actIndex] = activity;
    $("#new-activity-content").val("");

    //saves it to localStorage
    localStorage.setItem(monthIndex, JSON.stringify(monthDataObject));

    //adds it to day window
    var activityContainer = $("<li></li>");
    $("<p></p>", { "text": activity, "contenteditable": "true" }).data("activity", actIndex).appendTo($(activityContainer));
    $("<img />", { "src": "images/delete.png", "title": "delete"}).addClass("delete-activity").appendTo(activityContainer);
    $("<img />", { "src": "images/save.png", "title": "save"}).addClass("save-activity").appendTo(activityContainer);
    activityContainer.appendTo($(".day-activities"));

    //adds icon to day TD
    if (!selectedDayTD.hasClass("act"))
        selectedDayTD.addClass("act");
};

//deleting activity from day window and from localStorage
var deleteActivity = function (event) {
    var activityContainer = $(event.target).parent();
    var activityId = activityContainer.find("p").data("activity");

    monthDataObject[selectedDay].splice(activityId, 1); //deletes activity from month data object
    activityContainer.remove(); //removes it from the DOM

    localStorage.setItem(monthIndex, JSON.stringify(monthDataObject)); //saves modified month data object to localStorage

    //if there are no more activities for selected day removes icon from day TD
    if (monthDataObject[selectedDay].length === 0) 
          selectedDayTD.removeClass("act");
}

//saving changed activity content (if empty delete activity)
var saveActivity = function (event) {
    var activityContainer = $(event.target).parent();
    var activityPar = activityContainer.find("p");
    var activityId = activityPar.data("activity");
    //if activity content is empty delete entire activity
    if (activityPar.text().trim() === "") {
        monthDataObject[selectedDay].splice(activityId, 1);
        activityContainer.remove();

        //if there are no more activities for this day remove icon from day TD
        if (monthDataObject[selectedDay].length === 0)
            selectedDayTD.removeClass("act");
    }
    else {
        monthDataObject[selectedDay][activityId] = activityPar.text();
    }
    
    localStorage.setItem(monthIndex, JSON.stringify(monthDataObject));
}

var addDOMEventListeners = function () {
    $("button.prev").on("click", {direction: "prev"}, changeMonth);
    $("button.next").on("click", {direction: "next"}, changeMonth);
    $("table.calendar").on("click", "td.day", showDayContent);
    $("#day-content").on("click", function (event) { event.stopPropagation(); })
    $("#day-content").find(".day-header").on("click", "img", hideDayContent);

    $("#day-content").find(".new-activity").on("click", "button", createActivity);

    $("#day-content").on("click", ".delete-activity", deleteActivity);
    $("#day-content").on("click", ".save-activity", saveActivity);

    $(document).on("click", hideDayContent)
};

var main = function () {
    addDOMEventListeners();
    loadDefaultCalendar();
};

$(document).ready(main);