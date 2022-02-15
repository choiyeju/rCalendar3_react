import React, { Component, useEffect, useState } from 'react'

import CalendarHeader from './src_react/components/CalendarHeader';
import Sidebar from './src_react/components/Sidebar';
import Month from './src_react/components/Month';
// import axios from 'axios';
// import { parse } from '@babel/core';
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import gapi from 'react-gapi';
// import logo from './logo.svg';
//import ApiCalendar from 'react-google-calendar-api';
//import { Button, View } from 'react-native';

// const axios = require("axios");
// const cheerio = require("cheerio");
// const getHtml = async () => {
//   try {
//     return await axios.get("https://everytime.kr/timetable");
//   } catch (error) {
//     console.error(error);
//   }
// };
// console.log(getHtml)

// getHtml()
//   .then(html => {
//     let ulList = [];
//     const $ = cheerio.load(html.data);
//     const $bodyList = $("subject").children("td")
//     $bodyList.each(function(i, elem) {
//       ulList[i] = {
//           title: $(this).find('time').text(),
//           // image_url: $(this).find('name').attr('src'),
//           name: $(this).find('name'),
//           professor: $(this).find('professor'),
//           place: $(this).find('place'),
//       };
//     });

//     const data = ulList.filter(n => n.time);
//     console.log(data)
//     return data;
//   })
//   .then(res => {
// 	console.log(res)
//   });

var _title = ''
var last_title = ''
var _start = ''
var _end = ''
var _eventId = ''
var _tstart = ''
var _tend = ''
var _repeat = ''
var _repeat_option = ''
var r = false

function App() {
  // console.table(getMonth(3))
  const [loggedIn, setLoggedIn] = useState(false);

  var gapi = window.gapi
  var CLIENT_ID = "88262564393-247auf0fs74d92pggmbm5nfmprp6mesb.apps.googleusercontent.com"
  var API_KEY = "AIzaSyBuloUS31QvT13Wmz0HdmKA08Y4m3wTN5Y"
  var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"]
  // var SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
  var SCOPES = "https://www.googleapis.com/auth/calendar.events"

  function changeCalendar(change_events) {
    console.log(change_events)
    var containerEl = $('#external-events-list')[0];
    calendar = new FullCalendar.Draggable(containerEl, {
    itemSelector: '.fc-event',
    eventData: function(eventEl) {
      return {
        title: eventEl.innerText.trim()
      }
    }
    });
    var calendarEl = $('#calendar1')[0];
    calendar = new FullCalendar.Calendar(calendarEl, {
    headerToolbar: {
      left: 'today prev,next',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
    },
    locale: 'ko',
    editable: true,
    dayMaxEvents: 2,
    dayMaxEventRows: 2,
    contentHeight: 'auto',
    droppable: true,
    drop: function(arg) {
      arg.draggedEl.parentNode.removeChild(arg.draggedEl);
    },
    events: change_events,
    dateClick:function(event) {
      $("#repeat_insert").val("DAILY").prop('selected', true);
      $('#location').val('')
      $('#description').val('')

      onDisplay()
      change('', '')
      change2('', event.dateStr)
      change3('', event.dateStr)
      change5('', '')
      change6('', '')
      repeat_change('', '')

      $('#change').val('')
      $('#change2').val(event.dateStr)
      $('#change3').val(event.dateStr)
      $('#change4').val(_tstart)
      $('#change5').val(_tend)

      $("input:radio[name='repeat2']:radio[value='없음']").prop('checked', true);
      $("#number_insert").val(1);
      $("#날짜").val(makeYear($('#change2').val()));
      $("#다음").val(1);
      
      $("#repeat").val('매일').prop("selected",true);
      document.getElementById('time_check_insert').checked = false
      document.getElementById('time_repeat').checked = false
      $("#repeat").hide()
      $("#change4").hide()
      $("#change5").hide()
    },
    eventClick:function(event) {
      $("#repeat_update").val("DAILY").prop('selected', true);
      $('#location').val('')
      $('#description').val('')

      console.log(event)
      var mainStart = event.event.startStr
      var mainEnd = event.event.endStr
      var cstart = ''
      var cend = ''
      var tstart = ''
      var tend = ''
      change('', event.event._def.title)
      change2('', mainStart)
      change3('', mainEnd)
      change4(event.event._def.publicId)
      change5('', '')
      change6('', '')
      repeat_change('', '')
      last_title = event.event._def.title

      var yesterday = mainEnd
      if (mainStart !== mainEnd && mainEnd.length < 11)
        yesterday = makeYesterday(mainEnd)
      else{
        cstart = mainStart.substring(0, 10)
        cend = mainEnd.substring(0, 10)
        tstart = mainStart.substring(11, 16)
        tend = mainEnd.substring(11, 16)
        change2('', cstart)
        change3('', cend)
        change5('', tstart)
        change6('', tend)
        repeat_change('', '매주') //매일, 매주, 매월, 매년
      }

      var location = ''; var description = '';
      if (event.event._def.extendedProps.location != undefined) location = event.event._def.extendedProps.location
      if (event.event._def.extendedProps.description != undefined) description = event.event._def.extendedProps.description

      const element = document.getElementById('eventsCenter')
      if (mainEnd === "")
        element.innerHTML = Display(event.event._def.title, mainStart, mainStart, '', '', location, description)
      else if (mainEnd.length < 11)
        element.innerHTML = Display(event.event._def.title, mainStart, yesterday, '', '', location, description)
      else
        element.innerHTML = Display(event.event._def.title, cstart, cend, tstart, tend, location, description)
      onDisplayM()

      //parseInt(), 0~3, 5~6, 8~9
      $('#change6').val(event.event._def.title)
      $('#change9').val('')
      $('#change10').val('')
      if (mainStart.length < 11) {
        $('#change7').val(mainStart)
      }
      else {
        $('#change7').val(cstart)
        $('#change9').val(tstart)
      }
      
      if (mainEnd === "")
        $('#change8').val(mainStart)
      else if (mainStart !== mainEnd && mainEnd.length < 11)
        $('#change8').val(yesterday)
      else {
        $('#change8').val(cend)
        $('#change10').val(tend)
      }

      if (tstart != '') {
        document.getElementById('time_check_update').checked = true
        $('#change9').show()
        $('#change10').show()
      } else {
        document.getElementById('time_check_update').checked = false
        $('#change9').hide()
        $('#change10').hide()
      }

      if (event.event._def.extendedProps.recurring != undefined) {
        document.getElementById('time_repeat2').checked = true
        $('#repeat3').show(); r = true;
      } else {
        document.getElementById('time_repeat2').checked = false
        $('#repeat3').hide()
      }

      $("#number_update").val(1);
      $("#날짜").val(makeYear($('#change7').val()));
      $("#다음").val(1);
      $("input:radio[name='repeat4']:radio[value='없음']").prop('checked', true);
      $("#repeat3").val('매일').prop("selected",true);
    },
    });

    calendar.render();
  }

  const LoginOut = () => {
    gapi.auth.signOut(
      console.log('logout'),
      setLoggedIn(false),
    )
    changeCalendar([])
  }

  function change(e, title) {
    if ('' === e)
      _title = title
    else
      _title = e.target.value
  }
  function change2(e, start) {
    if ('' === e)
      _start = start
    else
      _start = e.target.value
  }
  function change3(e, end) {
    if ('' === e)
      _end = end
    else
      _end = e.target.value
  }
  function change4(eventId) {
    _eventId = eventId
  }
  function change5(e, tstart) {
    if ('' === e)
      _tstart = tstart
    else
      _tstart = e.target.value
  }
  function change6(e, tend) {
    if ('' === e)
      _tend = tend
    else
      _tend = e.target.value
  }
  function repeat_change(e, repeat) {
    if ('' === e)
      _repeat = repeat
    else
      _repeat = e.target.value
  }

  function makeTomorrow(end) {
    const year = parseInt(end[0])*1000 + parseInt(end[1])*100 + parseInt(end[2])*10 + parseInt(end[3])
    const month = parseInt(end[5])*10 + parseInt(end[6])
    const day = parseInt(end[8])*10 + parseInt(end[9])
    // toISOString()
    var t = new Date(year, month-1, day+1)
    var tomorrow = ''
    if (t.getMonth()+1 < 10)
      tomorrow = t.getFullYear() + "-0" + (t.getMonth()+1)
    else
      tomorrow = t.getFullYear() + "-" + (t.getMonth()+1)
    if (t.getDate() < 10)
      tomorrow += "-0" + t.getDate()
    else
      tomorrow += "-" + t.getDate()
    return tomorrow
  }
  function makeYesterday(end) {
    const year = parseInt(end[0])*1000 + parseInt(end[1])*100 + parseInt(end[2])*10 + parseInt(end[3])
    const month = parseInt(end[5])*10 + parseInt(end[6])
    const day = parseInt(end[8])*10 + parseInt(end[9])
    var y = new Date(year, month-1, day-1)
    var yesterday = '';
    if (y.getMonth()+1 < 10)
      yesterday = y.getFullYear() + "-0" + (y.getMonth()+1)
    else
      yesterday = y.getFullYear() + "-" + (y.getMonth()+1)
    if (y.getDate() < 10)
      yesterday += "-0" + y.getDate()
    else
      yesterday += "-" + y.getDate()
    return yesterday
  }
  function makeYear(end) {
    const year = parseInt(end[0])*1000 + parseInt(end[1])*100 + parseInt(end[2])*10 + parseInt(end[3])
    const month = parseInt(end[5])*10 + parseInt(end[6])
    const day = parseInt(end[8])*10 + parseInt(end[9])
    var y = new Date(year+1, month-1, day)
    var myear = '';
    if (y.getMonth()+1 < 10)
      myear = y.getFullYear() + "-0" + (y.getMonth()+1)
    else
      myear = y.getFullYear() + "-" + (y.getMonth()+1)
    if (y.getDate() < 10)
      myear += "-0" + y.getDate()
    else
      myear += "-" + y.getDate()
    return myear
  }

  /**
   * Print the summary and start datetime/date of the next ten events in
   * the authorized user's calendar. If no events are found an
   * appropriate message is printed.
   */
  function listUpcomingEvents() {
    var request = gapi.client.calendar.events.list({
      'calendarId': 'primary', /* Can be 'primary' or a given calendarid */
      // 'timeMin': (new Date(2022/1/28)).toISOString(),
      'showDeleted': false,
      'singleEvents': true,
      // 'maxResults': 100,
      'orderBy': 'startTime'
    });
    new_events = []
    request.execute(function(resp) {
      var events = resp.items;
      console.log(resp)
      if (events.length > 0) {
        for (i = 0; i < events.length; i++) {
          var event = events[i]
          var start = event.start.dateTime
          var end = event.end.dateTime
          var id = event.id
          
          if (!start) {
            start = event.start.date
            end = event.end.date
          }
          new_events[i] = {
            title : event.summary,
            start : start,
            end : end,
            location : event.location,
            description : event.description,
            id : id,
            recurring: event.recurringEventId,
          }
        }
      }
      (function(){
        $(function(){
          changeCalendar(new_events)
        });
      })();
    });
  }

  /**
   * Load Google Calendar client library. List upcoming events
   * once client library is loaded.
   */
  function loadCalendarApi() {
    gapi.client.load('calendar', 'v3', listUpcomingEvents);
  }

  /**
   * Handle response from authorization server.
   *
   * @param {Object} authResult Authorization result.
   */
  function handleAuthResult(authResult) {
    var authorizeDiv = document.getElementById('authorize-div');
    if (authResult && !authResult.error) {
      // Hide auth UI, then load client library.
      authorizeDiv.style.display = 'none';
      loadCalendarApi();
    } else {
      // Show auth UI, allowing the user to initiate authorization by
      // clicking authorize button.
      authorizeDiv.style.display = 'inline';
    }
  }

  /**
   * Initiate auth flow in response to user clicking authorize button.
   *
   * @param {Event} event Button click event.
   */
  function handleAuthClick(event) {
    gapi.auth.authorize(
      {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
      handleAuthResult)
      .then(() => {
        setLoggedIn(true);
      })
    return false;
  }

  function InsertEventsF(title, start, end, tstart, tend) {
    if (start === end){
      if (tstart[0]+tstart[1] > tend[0]+tend[1]){
        alert('시간 설정이 잘못되었습니다.')
        return
      }
      else if (tstart[0]+tstart[1] === tend[0]+tend[1])
        if (tstart[3]+tstart[4] > tend[3]+tend[4]){
          alert('시간 설정이 잘못되었습니다.')
          return
        }
    }

    var number = 0
    if ($("select[id=repeat_insert] option:selected").val() === 'DAILY')
      number = 1095
    else if ($("select[id=repeat_insert] option:selected").val() === 'WEEKLY')
      number = 156
    else if ($("select[id=repeat_insert] option:selected").val() === 'MONTHLY')
      number = 40
    else if ($("select[id=repeat_insert] option:selected").val() === 'YEARLY')
      number = 10
    var week = ''
    if (document.getElementById('MO').checked) week += 'MO,'
    if (document.getElementById('TU').checked) week += 'TU,'
    if (document.getElementById('WE').checked) week += 'WE,'
    if (document.getElementById('TH').checked) week += 'TH,'
    if (document.getElementById('FR').checked) week += 'FR,'
    if (document.getElementById('SA').checked) week += 'SA,'
    if (document.getElementById('SU').checked) week += 'SU,'
    week = week.slice(0, -1)
    var enddate = ''
    if ($("input[name=repeat2]:checked").val() === '날짜')
      enddate = $("#날짜").val().split('-')[0] + $("#날짜").val().split('-')[1] + $("#날짜").val().split('-')[2] + 'T000000Z'

    var repeat = null
    if ($("input[name=repeat2]:checked").val() === '없음') {
      repeat = 'RRULE:FREQ=' + $("select[id=repeat_insert] option:selected").val() +';INTERVAL=' + $("input[id=number_insert]").val() + ';COUNT=' + number + ';'
      if (week != '')
        repeat = 'RRULE:FREQ=' + $("select[id=repeat_insert] option:selected").val() +';BYDAY='+ week +';INTERVAL=' + $("input[id=number_insert]").val() + ';COUNT=' + number + ';'
    } else if ($("input[name=repeat2]:checked").val() === '날짜'){
      repeat = 'RRULE:FREQ=' + $("select[id=repeat_insert] option:selected").val() +';INTERVAL=' + $("input[id=number_insert]").val() + ';UNTIL=' + enddate + ';'
      if (week != '')
        repeat = 'RRULE:FREQ=' + $("select[id=repeat_insert] option:selected").val() +';BYDAY='+ week +';INTERVAL=' + $("input[id=number_insert]").val() + ';UNTIL=' + enddate + ';'
    } else if ($("input[name=repeat2]:checked").val() === '다음'){
      repeat = 'RRULE:FREQ=' + $("select[id=repeat_insert] option:selected").val() +';INTERVAL=' + $("input[id=number_insert]").val() + ';COUNT=' + $("input[id='다음']").val() + ';'
      if (week != '')
        repeat = 'RRULE:FREQ=' + $("select[id=repeat_insert] option:selected").val() +';BYDAY='+ week +';INTERVAL=' + $("input[id=number_insert]").val() + ';COUNT=' + $("input[id='다음']").val() + ';'
    }
    
    _repeat_option = $("select[id=repeat] option:selected").text()
    
    if (document.getElementById('time_repeat').checked) {
      if (_repeat_option === '매일'){
        repeat = 'RRULE:FREQ=DAILY;COUNT=1095'
      } else if (_repeat_option === '매주') {
        repeat = 'RRULE:FREQ=WEEKLY;COUNT=156'
      } else if (_repeat_option === '매월') {
        repeat = 'RRULE:FREQ=MONTHLY;COUNT=40'
      } else if (_repeat_option === '매년') {
        repeat = 'RRULE:FREQ=YEARLY;COUNT=10'
      } else if (_repeat_option === '주중 매일(월-금)') {
        repeat = 'RRULE:FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR;COUNT=807'
      }
    }
    console.log(repeat)

    var event = null;
    if (tstart != '' && document.getElementById('time_check_update').checked === true) {
      start = start + 'T' + tstart + ':00+09:00'
      end = end + 'T' + tend + ':00+09:00'
      event = {
        'summary': title,
        'location': $('#location').val(),
        'description': $('#description').val(),
        'start': {
          'dateTime': start,
          'timeZone': 'Asia/Dili'
        },
        'end': {
          'dateTime': end,
          'timeZone': 'Asia/Dili'
        },
        'recurrence': [
          repeat
        ],
        'reminders': {
          'useDefault': false,
          'overrides': [
            {'method': 'email', 'minutes': 24 * 60},
            {'method': 'popup', 'minutes': 10}
          ]
        }
      }
    } else {
      event = {
        'summary': title,
        'location': $('#location').val(),
        'description': $('#description').val(),
        'start': {
          'date': start,
        },
        'end': {
          'date': end,
        },
        'recurrence': [
          repeat
        ],
        'reminders': {
          'useDefault': false,
          'overrides': [
            {'method': 'email', 'minutes': 24 * 60},
            {'method': 'popup', 'minutes': 10}
          ]
        }
      }
    }
    var request = gapi.client.calendar.events.insert({
        'calendarId': 'primary',
        'resource': event,
    })
    request.execute(function(event) {
    })
    loadCalendarApi()
    $('#insertEvents').hide()
    offRepeat()
  }
  function updateEventsF(title, start, end, eventId, tstart, tend) {
    console.log('update')
    if (start === end){
      if (tstart[0]+tstart[1] > tend[0]+tend[1]){
        alert('시간 설정이 잘못되었습니다.')
        return
      }
      else if (tstart[0]+tstart[1] === tend[0]+tend[1])
        if (tstart[3]+tstart[4] > tend[3]+tend[4]){
          alert('시간 설정이 잘못되었습니다.')
          return
        }
    }

    var number = 0
    if ($("select[id=repeat_update] option:selected").val() === 'DAILY')
      number = 1095
    else if ($("select[id=repeat_update] option:selected").val() === 'WEEKLY')
      number = 156
    else if ($("select[id=repeat_update] option:selected").val() === 'MONTHLY')
      number = 40
    else if ($("select[id=repeat_update] option:selected").val() === 'YEARLY')
      number = 10
    var week = ''
    if (document.getElementById('MO2').checked) week += 'MO,'
    if (document.getElementById('TU2').checked) week += 'TU,'
    if (document.getElementById('WE2').checked) week += 'WE,'
    if (document.getElementById('TH2').checked) week += 'TH,'
    if (document.getElementById('FR2').checked) week += 'FR,'
    if (document.getElementById('SA2').checked) week += 'SA,'
    if (document.getElementById('SU2').checked) week += 'SU,'
    week = week.slice(0, -1)
    var enddate = ''
    if ($("input[name=repeat4]:checked").val() === '날짜')
      enddate = $("#날짜").val().split('-')[0] + $("#날짜").val().split('-')[1] + $("#날짜").val().split('-')[2] + 'T000000Z'

    var repeat = null
    if ($("input[name=repeat4]:checked").val() === '없음') {
      repeat = 'RRULE:FREQ=' + $("select[id=repeat_update] option:selected").val() +';INTERVAL=' + $("input[id=number_update]").val() + ';COUNT=' + number + ';'
      if (week != '')
        repeat = 'RRULE:FREQ=' + $("select[id=repeat_update] option:selected").val() +';BYDAY='+ week +';INTERVAL=' + $("input[id=number_update]").val() + ';COUNT=' + number + ';'
    } else if ($("input[name=repeat4]:checked").val() === '날짜'){
      repeat = 'RRULE:FREQ=' + $("select[id=repeat_update] option:selected").val() +';INTERVAL=' + $("input[id=number_update]").val() + ';UNTIL=' + enddate + ';'
      if (week != '')
        repeat = 'RRULE:FREQ=' + $("select[id=repeat_update] option:selected").val() +';BYDAY='+ week +';INTERVAL=' + $("input[id=number_update]").val() + ';UNTIL=' + enddate + ';'
    } else if ($("input[name=repeat4]:checked").val() === '다음'){
      repeat = 'RRULE:FREQ=' + $("select[id=repeat_update] option:selected").val() +';INTERVAL=' + $("input[id=number_update]").val() + ';COUNT=' + $("input[id='다음']").val() + ';'
      if (week != '')
        repeat = 'RRULE:FREQ=' + $("select[id=repeat_update] option:selected").val() +';BYDAY='+ week +';INTERVAL=' + $("input[id=number_update]").val() + ';COUNT=' + $("input[id='다음']").val() + ';'
    }
    
    _repeat_option = $("select[id=repeat3] option:selected").text()
    
    if (document.getElementById('time_repeat2').checked) {
      if (_repeat_option === '매일'){
        repeat = 'RRULE:FREQ=DAILY;COUNT=1095'
      } else if (_repeat_option === '매주') {
        repeat = 'RRULE:FREQ=WEEKLY;COUNT=156'
      } else if (_repeat_option === '매월') {
        repeat = 'RRULE:FREQ=MONTHLY;COUNT=40'
      } else if (_repeat_option === '매년') {
        repeat = 'RRULE:FREQ=YEARLY;COUNT=10'
      } else if (_repeat_option === '주중 매일(월-금)') {
        repeat = 'RRULE:FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR;COUNT=807'
      }
    }
    console.log(repeat)

    var event = null;
    if (tstart != '' && document.getElementById('time_check_update').checked === true) {
      start = start + 'T' + tstart + ':00+09:00'
      end = end + 'T' + tend + ':00+09:00'
      event = {
        'summary': title,
        'location': $('#location').val(),
        'description': $('#description').val(),
        'start': {
          'dateTime': start,
          'timeZone': 'Asia/Dili'
        },
        'end': {
          'dateTime': end,
          'timeZone': 'Asia/Dili'
        },
        'recurrence': [
          repeat
        ],
        'reminders': {
          'useDefault': false,
          'overrides': [
            {'method': 'email', 'minutes': 24 * 60},
            {'method': 'popup', 'minutes': 10}
          ]
        }
      }
    } else {
      event = {
        'summary': title,
        'location': $('#location').val(),
        'description': $('#description').val(),
        'start': {
          'date': start,
        },
        'end': {
          'date': end,
        },
        'recurrence': [
          repeat
        ],
        'reminders': {
          'useDefault': false,
          'overrides': [
            {'method': 'email', 'minutes': 24 * 60},
            {'method': 'popup', 'minutes': 10}
          ]
        }
      }
    }

    var request = gapi.client.calendar.events.update({
      'calendarId': 'primary',
      'eventId': eventId.split('_')[0],
      'resource': event
    });
    request.execute(function(event) {
    })
    loadCalendarApi()
    $('#updateEvents').hide()
    offRepeat()
  }
  function deleteEventsF(eventId) {
    var request = gapi.client.calendar.events.delete({
      'calendarId': 'primary',
      'eventId': eventId,
    });
    request.execute(function(event) {
    })
    loadCalendarApi()
    $('#updateEvents').hide()
    offRepeat()
  }

  function onDisplay() {
    $('#insertEvents').show()
  }
  function offDisplay() {
    $('#insertEvents').hide()
  }

  function onDisplayM() {
    $('#mainEvents').show()
  }
  function offDisplayM() {
    $('#mainEvents').hide()
  }

  function onDisplayU() {
    $('#mainEvents').hide()
    $('#updateEvents').show()
  }
  function offDisplayU() {
    $('#updateEvents').hide()
  }
  function offRepeat() {
    $('#insertEvents_repeat').hide()
    $('#updateEvents_repeat').hide()
    $('#updateEvents_repeat2').hide()
    $('#deleteEvents_repeat').hide()
  }

  function insertDisplay() {
    if ( _tstart == '')
      InsertEventsF(_title, _start, makeTomorrow(_end), _tstart, _tend)
    else 
      InsertEventsF(_title, _start, _end, _tstart, _tend)
  }
  function updateDisplay() {
    if ( _tstart == '')
      updateEventsF(_title, _start, _end, _eventId, _tstart, _tend)
    else 
      updateEventsF(_title, _start, _end, _eventId, _tstart, _tend)
  }
  function deleteDisplay() {
    _repeat_how = $("input[name=repeat2]:checked").val()
    if (_repeat_how === "모든 일정") {
      _eventId = _eventId.split('_')[0]
    } else if (_repeat_how === "이 일정" && _eventId.split('_')[1] != undefined) {
      _eventId = _eventId.split('_')[0]+"_"+_eventId.split('_')[1]
    } else { //나중에 수정하세요
      _eventId = _eventId.split('_')[0]
    }
    deleteEventsF(_eventId)
  }

  function repeat() {
    //요일체크
    var week = new Array('SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA');
    var today = new Date($('#change2').val()).getDay();
    var day = week[today];
    $("#week").hide();$("#week1").hide();$("#week2").hide();$("#week3").hide();$("#week4").hide();$("#week5").hide();$("#week6").hide();$("#week7").hide();
    $("#MO").val('MO').prop("checked",false); $("#MO").hide();
    $("#TU").val('TU').prop("checked",false); $("#TU").hide();
    $("#WE").val('WE').prop("checked",false); $("#WE").hide();
    $("#TH").val('TH').prop("checked",false); $("#TH").hide();
    $("#FR").val('FR').prop("checked",false); $("#FR").hide();
    $("#SA").val('SA').prop("checked",false); $("#SA").hide();
    $("#SU").val('SU').prop("checked",false); $("#SU").hide();
    //요일보이기
    if ($("select[id=repeat_insert] option:selected").text() === '주') {
      $("#week").show();$("#week1").show();$("#week2").show();$("#week3").show();$("#week4").show();$("#week5").show();$("#week6").show();$("#week7").show();
      $("#MO").show();$("#TU").show();$("#WE").show();$("#TH").show();$("#FR").show();$("#SA").show();$("#SU").show();
      $("#"+ day).val(day).prop("checked",true);
    }

    if ($("select[id=repeat] option:selected").text() === '맞춤') {
      $("#insertEvents_repeat").show()
    } else {
      $("input[name=repeat2]:checked").removeAttr('checked');
      offRepeat()
      insertDisplay()
    }
  }
  // function repeat1() {
  //   $("input:radio[name='repeat2']:radio[value='이 일정']").prop('checked', true);
  //   var test = document.getElementById('time_repeat2').checked
  //   if (test === true) {
  //     $("#updateEvents_repeat").show()
  //     _repeat_option = $("select[id=repeat2] option:selected").text()
  //   } 
  //   else {
  //     offRepeat()
  //     updateDisplay()
  //   }
  // }
  function repeat2() {
    var week = new Array('SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA');
    var today = new Date($('#change7').val()).getDay();
    var day = week[today];
    console.log(day)
    
    $("#week8").hide();$("#week9").hide();$("#week10").hide();$("#week11").hide();$("#week12").hide();$("#week13").hide();$("#week14").hide();$("#week15").hide();
    $("#MO2").val('MO').prop("checked",false); $("#MO2").hide();
    $("#TU2").val('TU').prop("checked",false); $("#TU2").hide();
    $("#WE2").val('WE').prop("checked",false); $("#WE2").hide();
    $("#TH2").val('TH').prop("checked",false); $("#TH2").hide();
    $("#FR2").val('FR').prop("checked",false); $("#FR2").hide();
    $("#SA2").val('SA').prop("checked",false); $("#SA2").hide();
    $("#SU2").val('SU').prop("checked",false); $("#SU2").hide();
    //요일보이기
    if ($("select[id=repeat_update] option:selected").text() === '주') {
      $("#week8").show();$("#week9").show();$("#week10").show();$("#week11").show();$("#week12").show();$("#week13").show();$("#week14").show();$("#week15").show();
      $("#MO2").show();$("#TU2").show();$("#WE2").show();$("#TH2").show();$("#FR2").show();$("#SA2").show();$("#SU2").show();
      $("#"+ day+"2").val(day).prop("checked",true);
    }
    
    if ($("select[id=repeat3] option:selected").text() === '맞춤') {
      $("#updateEvents_repeat2").show()
    } 
    // else if (r) {
    //   $("input[name=repeat4]:checked").removeAttr('checked');
    //   repeat1()
    // } 
    else {
      $("input[name=repeat4]:checked").removeAttr('checked');
      offRepeat()
      updateDisplay()
    }
  }
  function repeat3() {
    $("input:radio[name='repeat2']:radio[value='이 일정']").prop('checked', true);
    var test = document.getElementById('time_repeat2').checked
    if (test === true) {
      $("#deleteEvents_repeat").show()
      _repeat_option = $("select[id=repeat2] option:selected").text()
    } else {
      offRepeat()
      deleteDisplay()
    }
  }

  function Display(title, start, end, tstart, tend, location, description) {
    var d = ''
    if (tstart == '')
      d+= '<p>제목 | ' + title + '</p><p>' + start + '</p><p>' + end + '</p>'
    else
      d+= '<p>제목 | ' + title + '</p><p>' + start + " " + tstart + '</p><p>' + end + " " + tend + '</p>'
    if (location != '')
      d += '<p>위치 | ' + location + '</p>'
    if (description != '')
      d += '<p>내용 | ' + description + '</p>'
    return d
  }

  function time_check() {
    var test = document.getElementById('time_check_update').checked
    if (test === false) {
      $('#change9').hide()
      $('#change10').hide()
    } else {
      $('#change9').show()
      $('#change10').show()
    }
  }
  function time_check_insert() {
    var test = document.getElementById('time_check_insert').checked
    if (test === false) {
      $('#change4').hide()
      $('#change5').hide()
    } else {
      $('#change4').show()
      $('#change5').show()
    }
  }

  function time_repeat() {
    var test = document.getElementById('time_repeat').checked
    if (test === false) 
      $('#repeat').hide()
    else 
      $('#repeat').show()
  }
  function time_repeat2() {
    var test = document.getElementById('time_repeat2').checked
    if (test === false) 
      $('#repeat3').hide()
    else 
      $('#repeat3').show()
  }

  function list() {}

  const insertStyle = {
    padding: 10,
    display: 'none',
    position: 'absolute',
    width: 400,
    height: 500,
    backgroundColor: 'ivory',
    zIndex: 997,
  }
  const insertStyle_repeat = {
    padding: 10,
    display: 'none',
    position: 'absolute',
    width: 400,
    height: 500,
    backgroundColor: 'ivory',
    zIndex: 998,
  }
  const insertStyle_repeat2 = {
    padding: 10,
    display: 'none',
    position: 'absolute',
    width: 400,
    height: 500,
    backgroundColor: 'ivory',
    zIndex: 999,
  }

  //body - div - div - 2번div - table - tbody - tr - td

  if (loggedIn) {
    return (
      <div className='App'>
        <header className='App-header'>
          <div id="insertEvents_repeat" style={insertStyle_repeat}>
            <button onClick={offRepeat}>x</button>
            <button onClick={insertDisplay}>o</button>
            <p>반복 주기<input id="number_insert" type="number" min="1" />
              <select id="repeat_insert" onClick={repeat}>
                <option value="DAILY">일</option>
                <option value="WEEKLY">주</option>
                <option value="MONTHLY">월</option>
                <option value="YEARLY">년</option>
              </select>
            </p>
            <p id="week">반복 요일</p>
            <p>
              <input id="MO" type="checkbox" value="MO"/><span id="week1">월</span>
              <input id="TU" type="checkbox" value="TU"/><span id="week2">화</span>
              <input id="WE" type="checkbox" value="WE"/><span id="week3">수</span>
              <input id="TH" type="checkbox" value="TH"/><span id="week4">목</span>
              <input id="FR" type="checkbox" value="FR"/><span id="week5">금</span>
              <input id="SA" type="checkbox" value="SA"/><span id="week6">토</span>
              <input id="SU" type="checkbox" value="SU"/><span id="week7">일</span>
            </p>
            <p>종료</p>
            <p><input id="test1" type="radio" name="repeat2" value="없음"/>없음</p>
            <p><input type="radio" name="repeat2" value="날짜" />날짜<input id="날짜" type="date"/></p>
            <p><input type="radio" name="repeat2" value="다음" />다음<input id="다음" type="number" min="1"/></p>
          </div>
          <div id='insertEvents' style={insertStyle}>
            <button onClick={offDisplay}>x</button>
            <button onClick={repeat}>o</button>
            <p><input id="change" name="text" placeholder='(제목 및 시간 추가)' onChange={change} /></p>
            <p><input type="date" id="change2" name="text" onChange={change2} /><input type="time" id="change4" name="text" onChange={change5} /></p>
            <p><input type="date" id="change3" name="text" onChange={change3} /><input type="time" id="change5" name="text" onChange={change6} /></p>
            <p><input id="time_check_insert" type="checkbox" onChange={time_check_insert} /></p>
            <p>
              <input id="time_repeat" type="checkbox" onChange={time_repeat} />
              <select id="repeat">
                <option value="매일">매일</option>
                <option value="매주">매주</option>
                <option value="매월">매월</option>
                <option value="매년">매년</option>
                <option value="주중_매일(월-금)">주중 매일(월-금)</option>
                <option value="맞춤">맞춤</option>
              </select>
            </p>
            <p><input id="location" type="text" placeholder='위치 추가'/></p>
            <p><input id="description" type="text" placeholder='내용 추가'/></p>
          </div>

          <div id='mainEvents' style={insertStyle}>
            <button onClick={offDisplayM}>x</button>
            <button onClick={onDisplayU}>update</button>
            <div id='eventsCenter'></div>
          </div>

          <div id="updateEvents_repeat" style={insertStyle_repeat2}>
            <button onClick={offRepeat}>x</button>
            <button onClick={updateDisplay}>o</button>
            <p><input id="test1" type="radio" name="repeat2" value="이 일정"/>이 일정</p>
            <p><input type="radio" name="repeat2" value="이 일정 및 향후 일정" />이 일정 및 향후 일정</p>
            <p><input type="radio" name="repeat2" value="모든 일정" />모든 일정</p>
          </div>
          <div id="deleteEvents_repeat" style={insertStyle_repeat}>
            <button onClick={offRepeat}>x</button>
            <button onClick={deleteDisplay}>o</button>
            <p><input id="test1" type="radio" name="repeat2" value="이 일정"/>이 일정</p>
            <p><input type="radio" name="repeat2" value="이 일정 및 향후 일정" />이 일정 및 향후 일정</p>
            <p><input type="radio" name="repeat2" value="모든 일정" />모든 일정</p>
          </div>

          <div id="updateEvents_repeat2" style={insertStyle_repeat}>
            <button onClick={offRepeat}>x</button>
            <button onClick={updateDisplay}>o</button>
            <p>반복 주기<input id="number_update" type="number" min="1" />
              <select id="repeat_update" onClick={repeat2}>
                <option value="DAILY">일</option>
                <option value="WEEKLY">주</option>
                <option value="MONTHLY">월</option>
                <option value="YEARLY">년</option>
              </select>
            </p>
            <p id="week8">반복 요일</p>
            <p>
              <input id="MO2" type="checkbox" value="MO"/><span id="week9">월</span>
              <input id="TU2" type="checkbox" value="TU"/><span id="week10">화</span>
              <input id="WE2" type="checkbox" value="WE"/><span id="week11">수</span>
              <input id="TH2" type="checkbox" value="TH"/><span id="week12">목</span>
              <input id="FR2" type="checkbox" value="FR"/><span id="week13">금</span>
              <input id="SA2" type="checkbox" value="SA"/><span id="week14">토</span>
              <input id="SU2" type="checkbox" value="SU"/><span id="week15">일</span>
            </p>
            <p>종료</p>
            <p><input id="test1" type="radio" name="repeat4" value="없음"/>없음</p>
            <p><input type="radio" name="repeat4" value="날짜" />날짜<input id="날짜" type="date"/></p>
            <p><input type="radio" name="repeat4" value="다음" />다음<input id="다음" type="number" min="1"/></p>
          </div>
          <div id='updateEvents' style={insertStyle}>
            <button onClick={offDisplayU}>x</button>
            <button onClick={repeat2}>o</button>
            <button onClick={repeat3}>delete</button>
            <p><input id="change6" name="text" onChange={change} /></p>
            <p><input type="date" id="change7" name="text" onChange={change2} /><input type="time" id="change9" name="text" onChange={change5} /></p>
            <p><input type="date" id="change8" name="text" onChange={change3} /><input type="time" id="change10" name="text" onChange={change6} /></p>
            <p><input id="time_check_update" type="checkbox" onChange={time_check} /></p>
            <p>
              <input id="time_repeat2" type="checkbox" onChange={time_repeat2} />
              <select id="repeat3">
                <option value="매일">매일</option>
                <option value="매주">매주</option>
                <option value="매월">매월</option>
                <option value="매년">매년</option>
                <option value="주중_매일(월-금)">주중 매일(월-금)</option>
                <option value="맞춤">맞춤</option>
              </select>
            </p>
            <p><input id="location" type="text" placeholder='위치 추가'/></p>
            <p><input id="description" type="text" placeholder='내용 추가'/></p>
          </div>
          {/* <div id='updateEvents_repeat' style={insertStyle}>
            <button onClick={offDisplayU}>x</button>
            <button onClick={deleteDisplay}>o</button>
            <p><input id="change6" name="text" onChange={change} /></p>
            <p><input type="date" id="change7" name="text" onChange={change2} /><input type="time" id="change9" name="text" onChange={change5} /></p>
            <p><input type="date" id="change8" name="text" onChange={change3} /><input type="time" id="change10" name="text" onChange={change6} /></p>
            <p><input id="time_check_update" type="checkbox" onChange={time_check} /></p>
            <p>
              <input id="time_repeat2" type="checkbox" onChange={time_repeat2} />
              <select id="repeat2" onChange={repeat_change}>
                <option value="이일정">매일</option>
                <option value="모든일정">매주</option>
              </select>
            </p>
          </div> */}

          <button onClick={list}>시간표</button>
          <div id='wrap'>
            <div id='external-events'>
              <div id='external-events-list'></div>
            </div>
            <div id='calendar-wrap'>
              <div id='calendar1'></div>
            </div>
          </div>
          <button onClick={LoginOut}>logout</button>
        </header>
      </div>
    );
  }
  return (
    <div className='App'>
      <div id="authorize-div">
        {handleAuthClick(event)}
      </div>
    </div>
  );
}

export default App;

// import React from 'react'
// import {View, Text} from 'react-native';

// function App() {
//   return (
//     <View>
//       <Text>Hello world from react</Text>
//     </View>
//   )
// }

// export default App