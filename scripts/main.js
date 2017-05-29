var month = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

var currentDate,
    selectedMonth,
    selectedYear,
    selectedDay,
    monthIndex;

var selectedDayTD;

var dayContentVisible = false;

var monthDataObject;

var createCalendarTab = function () {
    var calTab = $("table.calendar");
    var i, j;
    for (j = 1; j <= 6; ++j) {
        var tr = $("<tr></tr>");
        for (i = 1; i <= 7; ++i) {
            tr.append($("<td></td>"));
        }
        tr.appendTo(calTab);
    }
};

var loadMonthData = function () {
    var value = localStorage.getItem(monthIndex);
    if (!value) {
        monthDataObject = null;
        return;
    }
    monthDataObject = JSON.parse(value);
}

var fillCalendar = function (first, count) {
    var daysTD = $("table.calendar").find("td");
    var tdIndex = first + 7;
    var dayText = "1 <img src='images/activities.png' alt= '' />";
    if (monthDataObject && monthDataObject[1] && monthDataObject[1].length > 0) {
        daysTD.eq(tdIndex).addClass("act");
    }
    daysTD.eq(tdIndex).html(dayText).data("day", 1).addClass("day");
    tdIndex += 1;
    var day = 2;
    for (; day <= count; ++day, ++tdIndex) {
        var dayText = day + "<img src='images/activities.png' alt='' />";
        if (monthDataObject && monthDataObject[day] && monthDataObject[day].length > 0) {
            daysTD.eq(tdIndex).addClass("act");
        }
        daysTD.eq(tdIndex).html(dayText).data("day", day).addClass("day");
    }

    pointCurrentDay();
};

var pointCurrentDay = function () {

    if ((selectedMonth == new Date().getMonth()) && (selectedYear == new Date().getFullYear())) {
        
        var daysTD = $("table.calendar").find("td.day");
        daysTD.eq(new Date().getDate() - 1).addClass("current-day");

    }
};

var clearCalendar = function () {
    $("table.calendar").find("tr:not(.days-of-week)").remove();
}

//after refreshing website
var loadDefaultCalendar = function () {

    createCalendarTab();

    currentDate = new Date();
    selectedMonth = currentDate.getMonth();
    selectedYear = currentDate.getFullYear();
    monthIndex = selectedYear + "." + selectedMonth;
    $("p.month-name").text(month[selectedMonth] + " " + selectedYear);
   
    var dayCount = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    var firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); //sunday - 0, monday - 1
    loadMonthData();
    fillCalendar(firstDay, dayCount);
};

//selecting calendar for previous month 
var loadPreviousMonth = function () {
    clearCalendar();
    createCalendarTab();

    if (selectedMonth === 0) {
        selectedMonth = 11;
        selectedYear -= 1;
    }
    else {
        selectedMonth -= 1;
    }
    monthIndex = selectedYear + "." + selectedMonth;
    $("p.month-name").text(month[selectedMonth] + " " + selectedYear);

    var dayCount = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    var firstDay = new Date(selectedYear, selectedMonth, 1).getDay(); //sunday - 0, monday - 1
    loadMonthData();
    fillCalendar(firstDay, dayCount);

};

//selecting calendar for previous month
var loadNextMonth = function () {
    clearCalendar();
    createCalendarTab();

    if (selectedMonth === 11) {
        selectedMonth = 0;
        selectedYear += 1;
    }
    else {
        selectedMonth += 1;
    }
    monthIndex = selectedYear + "." + selectedMonth;
    $("p.month-name").text(month[selectedMonth] + " " + selectedYear);

    var dayCount = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    var firstDay = new Date(selectedYear, selectedMonth, 1).getDay(); //sunday - 0, monday - 1
    loadMonthData();
    fillCalendar(firstDay, dayCount);
};

//showing activities for selected day
var showDayContent = function (event) {
    selectedDayTD = $(event.target);
    if (!selectedDayTD.hasClass("day"))
        return;

    event.stopPropagation();

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

    selectedDay = selectedDayTD.data("day");
    $(".day-activities").empty();
    if (monthDataObject && monthDataObject[selectedDay]) {
        
        var activities = monthDataObject[selectedDay];
        var i = 0;
        for (; i < activities.length; ++i) {
            var activityContainer = $("<li></li>");
            $("<p></p>", { "text": activities[i], "contenteditable": "true" }).data("activity", i).appendTo(activityContainer);
            $("<img />", { "src": "images/delete.png", "title": "delete", "click": clickDeleteActivity }).appendTo(activityContainer);
            $("<img />", { "src": "images/save.png", "title": "save", "click": clickSaveActivity }).appendTo(activityContainer);
            activityContainer.appendTo($(".day-activities"));
        }
    }

    $("#day-content").css({ "left": left, "top": top });
    $("#day-content").find("p.day-info").text(selectedDay + " " + month[selectedMonth] + " " + selectedYear);
    $("#day-content").show();

    dayContentVisible = true;
};

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
    if (!monthDataObject) {
        monthDataObject = {};
        monthDataObject[selectedDay] = [];
    }
    if (!monthDataObject[selectedDay]) {
        monthDataObject[selectedDay] = [];
    }
    var actIndex = monthDataObject[selectedDay].length;
    monthDataObject[selectedDay][actIndex] = activity;
    $("#new-activity-content").val("");

    localStorage.setItem(monthIndex, JSON.stringify(monthDataObject));

    $(".day-activities").empty();
    var activities = monthDataObject[selectedDay];
    var i = 0;
    for (; i < activities.length; ++i) {
        var activityContainer = $("<div></div>");
        $("<p></p>", { "text": activities[i], "contenteditable": "true" }).data("activity", i).appendTo($(activityContainer));
        $("<img />", { "src": "images/delete.png", "title": "delete", "click": clickDeleteActivity }).appendTo(activityContainer);
        $("<img />", { "src": "images/save.png", "title": "save", "click": clickSaveActivity }).appendTo(activityContainer);
        activityContainer.appendTo($(".day-activities"));
    }

    if (!selectedDayTD.hasClass("act"))
        selectedDayTD.addClass("act");
};

var clickDeleteActivity = function (event) {
    var activityContainer = $(event.target).parent();
    var activityId = activityContainer.find("p").data("activity");

    monthDataObject[selectedDay].splice(activityId, 1);
    activityContainer.remove();

    localStorage.setItem(monthIndex, JSON.stringify(monthDataObject));

    if (monthDataObject[selectedDay].length === 0) 
          selectedDayTD.removeClass("act");
}

var clickSaveActivity = function (event) {
    var activityContainer = $(event.target).parent();
    var activityPar = activityContainer.find("p");
    var activityId = activityPar.data("activity");
    if (activityPar.text().trim() === "") {
        monthDataObject[selectedDay].splice(activityId, 1);
        activityContainer.remove();

        if (monthDataObject[selectedDay].length === 0)
            selectedDayTD.removeClass("act");
    }
    else {
        monthDataObject[selectedDay][activityId] = activityPar.text();
    }
    
    localStorage.setItem(monthIndex, JSON.stringify(monthDataObject));
}

var addDOMEventListeners = function () {
    $("button.prev").on("click", loadPreviousMonth);
    $("button.next").on("click", loadNextMonth);
    $("table.calendar").on("click", "td", showDayContent);
    $("#day-content").on("click", function (event) { event.stopPropagation(); })
    $("#day-content").find(".day-header").on("click", "img", hideDayContent);
    $("#day-content").find(".new-activity").on("click", "button", createActivity);
    $(document).on("click", hideDayContent)
};

var main = function () {
    addDOMEventListeners();
    loadDefaultCalendar();
};

$(document).ready(main);