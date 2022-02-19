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
var t = ''; var l = ''; var d = '';
var _change_events = ''
var _r = false

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
      $("#repeat_insert2").val("same_day").prop('selected', true);
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
      $("#insert_date").val(makeYear($('#change2').val()));
      $("#insert_count").val(1);
      
      $("#repeat").val('매일').prop("selected",true);
      document.getElementById('time_check_insert').checked = false
      document.getElementById('time_repeat').checked = false
      $("#repeat").hide()
      $("#change4").hide()
      $("#change5").hide()
    },
    eventClick:function(event) {
      $("#repeat_update").val("DAILY").prop('selected', true);
      $("#repeat_update2").val("same_day").prop('selected', true);
      $('#location2').val('')
      $('#description2').val('')
      $("#repeat3").val('매일').prop("selected",true);
      _change_events = change_events
      $("input:radio[name='repeat4']:radio[value='없음']").prop('checked', true);

      $("#week8").hide();$("#week9").hide();$("#week10").hide();$("#week11").hide();$("#week12").hide();$("#week13").hide();$("#week14").hide();$("#week15").hide();
      $("#MO2").val('MO').prop("checked",false);
      $("#TU2").val('TU').prop("checked",false);
      $("#WE2").val('WE').prop("checked",false);
      $("#TH2").val('TH').prop("checked",false);
      $("#FR2").val('FR').prop("checked",false);
      $("#SA2").val('SA').prop("checked",false);
      $("#SU2").val('SU').prop("checked",false);
      $('#repeat_update2').hide();

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

      const element = document.getElementById('eventsCenter')
      var location = ''; var description = '';
      if (event.event._def.extendedProps.location != undefined) location = event.event._def.extendedProps.location
      if (event.event._def.extendedProps.description != undefined) description = event.event._def.extendedProps.description

      if (event.event._def.publicId.split('_').length === 2) {
        var requestRecurringEvent = gapi.client.calendar.events.get({
          'calendarId': 'primary',
          'eventId': event.event._def.publicId.split('_')[0]
        });
        requestRecurringEvent.execute(function(resp) {
          recurrence = resp.recurrence;
          var re = recurrence[0].split(';')
          var re2 = []
          for (var i = 0; i < re.length; i++) {
            re2[i] = re[i].split('=');
          }
          if (re.length > 1) {
            $("#repeat3").val('맞춤').prop("selected",true);
            $("#repeat_update").val(re2[0][1]).prop("selected",true);
          }
          else if (re2[0][1] === 'DAILY')
            $("#repeat3").val('매일').prop("selected",true);
          else if (re2[0][1] === 'WEEKLY')
            $("#repeat3").val('매주').prop("selected",true);
          else if (re2[0][1] === 'MONTHLY')
            $("#repeat3").val('매월').prop("selected",true);
          else if (re2[0][1] === 'YEARLY')
            $("#repeat3").val('매년').prop("selected",true);

          if (mainEnd === "")
            element.innerHTML = Display(event.event._def.title, mainStart, mainStart, '', '', location, description, re2)
          else if (mainEnd.length < 11)
            element.innerHTML = Display(event.event._def.title, mainStart, yesterday, '', '', location, description, re2)
          else
            element.innerHTML = Display(event.event._def.title, cstart, cend, tstart, tend, location, description, re2)
        });
      } else {

        if (mainEnd === "")
          element.innerHTML = Display(event.event._def.title, mainStart, mainStart, '', '', location, description, [])
        else if (mainEnd.length < 11)
          element.innerHTML = Display(event.event._def.title, mainStart, yesterday, '', '', location, description, [])
        else
          element.innerHTML = Display(event.event._def.title, cstart, cend, tstart, tend, location, description, [])
      }
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
        _r = document.getElementById('time_repeat2').checked;
        $('#repeat3').show();
      } else {
        document.getElementById('time_repeat2').checked = false
        $('#repeat3').hide()
      }

      $("#number_update").val(1);
      $("#update_date").val(makeYear($('#change7').val()));
      $("#update_count").val(1);
      t = event.event._def.title; l = location; d = description;
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
            htmlLink: event.htmlLink,
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
      enddate = $("#insert_date").val().split('-')[0] + $("#insert_date").val().split('-')[1] + $("#insert_date").val().split('-')[2] + 'T000000Z'

    var repeat = null
    if ($("input[name=repeat2]:checked").val() === '없음') {
      repeat = 'RRULE:FREQ=' + $("select[id=repeat_insert] option:selected").val() +';INTERVAL=' + $("input[id=number_insert]").val() + ';'
    } else if ($("input[name=repeat2]:checked").val() === '날짜'){
      repeat = 'RRULE:FREQ=' + $("select[id=repeat_insert] option:selected").val() +';INTERVAL=' + $("input[id=number_insert]").val() + ';UNTIL=' + enddate + ';'
    } else if ($("input[name=repeat2]:checked").val() === '다음'){
      repeat = 'RRULE:FREQ=' + $("select[id=repeat_insert] option:selected").val() +';INTERVAL=' + $("input[id=number_insert]").val() + ';COUNT=' + $("input[id='insert_count']").val() + ';'
    }
    if (week != '') {
      repeat += 'BYDAY='+ week +';'
    }
    var month = ''
    if ($("select[id=repeat_insert] option:selected").val() === 'MONTHLY') {
      if ($("select[id=repeat_insert2] option:selected").val() === 'same_week') {
        console.log('same_week')
        // repeat += ''+month
      }
    }
    
    _repeat_option = $("select[id=repeat] option:selected").text()
    
    if (document.getElementById('time_repeat').checked) {
      if (_repeat_option === '매일'){
        repeat = 'RRULE:FREQ=DAILY;'
      } else if (_repeat_option === '매주') {
        repeat = 'RRULE:FREQ=WEEKLY;'
      } else if (_repeat_option === '매월') {
        repeat = 'RRULE:FREQ=MONTHLY;'
      } else if (_repeat_option === '매년') {
        repeat = 'RRULE:FREQ=YEARLY;'
      } else if (_repeat_option === '주중 매일(월-금)') {
        repeat = 'RRULE:FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR;'
      }
    }else repeat = null
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
  function updateEventsF(title, start, end, eventId, tstart, tend, repeat) {
    console.log('update')
    if (start === end){
      if (tstart[0]+tstart[1] > tend[0]+tend[1]) {
        alert('시간 설정이 잘못되었습니다.')
        return
      }
      else if (tstart[0]+tstart[1] === tend[0]+tend[1]) {
        if (tstart[3]+tstart[4] > tend[3]+tend[4]) {
          alert('시간 설정이 잘못되었습니다.')
          return
        }
      }
    }

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
      enddate = $("#update_date").val().split('-')[0] + $("#update_date").val().split('-')[1] + $("#update_date").val().split('-')[2] + 'T000000Z'

    var repeat2 = null
    if ($("input[name=repeat4]:checked").val() === '없음') {
      repeat2 = 'RRULE:FREQ=' + $("select[id=repeat_update] option:selected").val() +';INTERVAL=' + $("input[id=number_update]").val()
    } else if ($("input[name=repeat4]:checked").val() === '날짜'){
      repeat2 = 'RRULE:FREQ=' + $("select[id=repeat_update] option:selected").val() +';INTERVAL=' + $("input[id=number_update]").val() + ';UNTIL=' + enddate
    } else if ($("input[name=repeat4]:checked").val() === '다음'){
      repeat2 = 'RRULE:FREQ=' + $("select[id=repeat_update] option:selected").val() +';INTERVAL=' + $("input[id=number_update]").val() + ';COUNT=' + $("input[id='update_count']").val()
    }
    if (week != '') {
      repeat2 += ';BYDAY='+ week
    }
    var month = ''
    if ($("select[id=repeat_update] option:selected").val() === 'MONTHLY') {
      if ($("select[id=repeat_update2] option:selected").val() === 'same_week') {
        console.log('same_week')
        // repeat += ''+month
      }
    }
    
    _repeat_option = $("select[id=repeat3] option:selected").text()
    
    if (document.getElementById('time_repeat2').checked) {
      if (_repeat_option === '매일') {
        repeat2 = 'RRULE:FREQ=DAILY'
      } else if (_repeat_option === '매주') {
        repeat2 = 'RRULE:FREQ=WEEKLY'
      } else if (_repeat_option === '매월') {
        repeat2 = 'RRULE:FREQ=MONTHLY'
      } else if (_repeat_option === '매년') {
        repeat2 = 'RRULE:FREQ=YEARLY'
      } else if (_repeat_option === '주중 매일(월-금)') {
        repeat2 = 'RRULE:FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR'
      }
    } else repeat2 = null

    console.log(repeat2)
    var eventId2 = ''
    if ($("input[name=repeat5]:checked").val() === "이 일정") { //반복 바뀐 경우
      console.log("1")
      eventId2 = eventId
      repeat2 = null
    } else if ($("input[name=repeat5]:checked").val() === "이 일정 및 향후 일정") {
      console.log("2")
      eventId2 = eventId.split('_')[0]
      //반복할 때 위쪽에 있으면 종료일 알아서 찾기
      // insertDisplay()
    }
    else {
      console.log("3")
      eventId2 = eventId.split('_')[0]
    }

    var event = null;
    if (tstart != '' && document.getElementById('time_check_update').checked === true) {
      start = start + 'T' + tstart + ':00+09:00'
      end = end + 'T' + tend + ':00+09:00'
      event = {
        'summary': title,
        'location': $('#location2').val(),
        'description': $('#description2').val(),
        'start': {
          'dateTime': start,
          'timeZone': 'Asia/Dili'
        },
        'end': {
          'dateTime': end,
          'timeZone': 'Asia/Dili'
        },
        'recurrence': [
          repeat2
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
        'location': $('#location2').val(),
        'description': $('#description2').val(),
        'start': {
          'date': start,
        },
        'end': {
          'date': end,
        },
        'recurrence': [
          repeat2
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
    
    // var request = gapi.client.calendar.events.update({
    //   'calendarId': 'primary',
    //   'eventId': eventId2,
    //   'resource': event
    // });
    // request.execute(function(event) {
    // })
    // loadCalendarApi()
    // $('#updateEvents').hide()
    // offRepeat()
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
  function updateDisplay(repeat) {
    if ( _tstart == '')
      updateEventsF(_title, _start, _end, _eventId, _tstart, _tend, repeat)
    else 
      updateEventsF(_title, _start, _end, _eventId, _tstart, _tend, repeat)
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
    $('#repeat_insert2').hide();
    //요일보이기
    if ($("select[id=repeat_insert] option:selected").text() === '주') {
      $("#week").show();$("#week1").show();$("#week2").show();$("#week3").show();$("#week4").show();$("#week5").show();$("#week6").show();$("#week7").show();
      $("#MO").show();$("#TU").show();$("#WE").show();$("#TH").show();$("#FR").show();$("#SA").show();$("#SU").show();
      $("#"+ day).val(day).prop("checked",true);
    }
    if ($("select[id=repeat_insert] option:selected").text() === '월') {
      $('#repeat_insert2').show()
    }

    if ($("select[id=repeat] option:selected").text() === '맞춤') {
      $("#insertEvents_repeat").show()
    } else {
      $("input[name=repeat2]:checked").removeAttr('checked');
      offRepeat()
      insertDisplay()
    }
  }
  function repeat1() {
    var week = ''
    if (document.getElementById('SU2').checked) week += 'SU,'
    if (document.getElementById('SA2').checked) week += 'SA,'
    if (document.getElementById('FR2').checked) week += 'FR,'
    if (document.getElementById('TH2').checked) week += 'TH,'
    if (document.getElementById('WE2').checked) week += 'WE,'
    if (document.getElementById('TU2').checked) week += 'TU,'
    if (document.getElementById('MO2').checked) week += 'MO,'
    week = week.slice(0, -1)
    var enddate = ''
    if ($("input[name=repeat4]:checked").val() === '날짜')
      enddate = $("#update_date").val().split('-')[0] + $("#update_date").val().split('-')[1] + $("#update_date").val().split('-')[2] + 'T000000Z'

    var repeat = null
    if ($("input[name=repeat4]:checked").val() === '없음') {
      repeat = 'RRULE:FREQ=' + $("select[id=repeat_update] option:selected").val() +';INTERVAL=' + $("input[id=number_update]").val()
    } else if ($("input[name=repeat4]:checked").val() === '날짜'){
      repeat = 'RRULE:FREQ=' + $("select[id=repeat_update] option:selected").val() +';INTERVAL=' + $("input[id=number_update]").val() + ';UNTIL=' + enddate
    } else if ($("input[name=repeat4]:checked").val() === '다음'){
      repeat = 'RRULE:FREQ=' + $("select[id=repeat_update] option:selected").val() +';INTERVAL=' + $("input[id=number_update]").val() + ';COUNT=' + $("input[id='update_count']").val()
    }
    if (week != '') {
      repeat += ';BYDAY='+ week
    }
    var month = ''
    if ($("select[id=repeat_update] option:selected").val() === 'MONTHLY') {
      if ($("select[id=repeat_update2] option:selected").val() === 'same_week') {
        console.log('same_week')
        // repeat += ''+month
      }
    }
    
    _repeat_option = $("select[id=repeat3] option:selected").text()
    
    if (document.getElementById('time_repeat2').checked) {
      if (_repeat_option === '매일') {
        repeat = 'RRULE:FREQ=DAILY'
      } else if (_repeat_option === '매주') {
        repeat = 'RRULE:FREQ=WEEKLY'
      } else if (_repeat_option === '매월') {
        repeat = 'RRULE:FREQ=MONTHLY'
      } else if (_repeat_option === '매년') {
        repeat = 'RRULE:FREQ=YEARLY'
      } else if (_repeat_option === '주중 매일(월-금)') {
        repeat = 'RRULE:FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR'
      }
    } else repeat = null

    var test = document.getElementById('time_repeat2').checked
    if (test === true) {
      var requestRecurringEvent = gapi.client.calendar.events.get({
        'calendarId': 'primary',
        'eventId': _eventId.split('_')[0]
      });
      requestRecurringEvent.execute(function(resp) {
        recurrence = (resp.recurrence)[0];
        var r = false
        var a = recurrence.split(';'); var a2 = []
        var b = repeat.split(';'); var b2 = []
        for (var i = 0; i < a.length; i++) a2[i] = a[i].split('='); for (var i = 0; i < b.length; i++) b2[i] = b[i].split('=');
        if (a2[0][1] === b2[0][1]){
          var a3 = ['1', '', '', '']; var b3 = ['', '', '', '']
          for (var i = 0; i < a2.length; i++) {
            if (a2[i][0] === 'INTERVAL') a3[0] = a2[i][1];
            else if (a2[i][0] === 'COUNT') a3[1] = a2[i][1];
            else if (a2[i][0] === 'UNTIL') a3[2] = a2[i][1];
            else if (a2[i][0] === 'BYDAY') a3[3] = a2[i][1];
          }
          for (var i = 0; i < b2.length; i++) {
            if (b2[i][0] === 'INTERVAL') b3[0] = b2[i][1];
            else if (b2[i][0] === 'COUNT') b3[1] = b2[i][1];
            else if (b2[i][0] === 'UNTIL') b3[2] = b2[i][1];
            else if (b2[i][0] === 'BYDAY') b3[3] = b2[i][1];
          }
          for (var i = 0; i < 4; i++) 
            if (a3[i] !== b3[i]) r = true
          console.log(a3); console.log(b3)
        } else r = true

        if (r && test === true && _r === true) { //반복 바뀐 경우
          $('#test2').hide();$('#test3').hide();
          $("input:radio[name='repeat5']:radio[value='이 일정 및 향후 일정']").prop('checked', true);
          $("#updateEvents_repeat").show()
          _repeat_option = $("select[id=repeat2] option:selected").text()
        } else if ((t != $('#change6').val() || l != $('#location2').val() || d != $('#description2').val()) && test === true && _r === true) {
          $('#test2').show();$('#test3').show();
          $("input:radio[name='repeat5']:radio[value='이 일정']").prop('checked', true);
          $("#updateEvents_repeat").show()
          _repeat_option = $("select[id=repeat2] option:selected").text()
        }
        else {
          $("input:radio[name='repeat2']:radio[value='모든 일정']").prop('checked', true);
          offRepeat()
          updateDisplay(repeat)
        }
      });
    }

  }
  function repeat2() {
    var week = new Array('SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA');
    var today = new Date($('#change7').val()).getDay();
    var day = week[today];
    $("#MO2").val('MO').prop("checked",false);
    $("#TU2").val('TU').prop("checked",false);
    $("#WE2").val('WE').prop("checked",false);
    $("#TH2").val('TH').prop("checked",false);
    $("#FR2").val('FR').prop("checked",false);
    $("#SA2").val('SA').prop("checked",false);
    $("#SU2").val('SU').prop("checked",false);
    $("#"+ day+"2").val(day).prop("checked",true);
    $("#week8").hide();$("#week9").hide();$("#week10").hide();$("#week11").hide();$("#week12").hide();$("#week13").hide();$("#week14").hide();$("#week15").hide();
    $("#MO2").hide(); $("#TU2").hide(); $("#WE2").hide(); $("#TH2").hide(); $("#FR2").hide(); $("#SA2").hide(); $("#SU2").hide(); $('#repeat_update2').hide();
    //요일보이기
    if ($("select[id=repeat_update] option:selected").text() === '주') {
      $("#week8").show();$("#week9").show();$("#week10").show();$("#week11").show();$("#week12").show();$("#week13").show();$("#week14").show();$("#week15").show();
      $("#MO2").show();$("#TU2").show();$("#WE2").show();$("#TH2").show();$("#FR2").show();$("#SA2").show();$("#SU2").show();
    }
    if ($("select[id=repeat_update] option:selected").text() === '월') {
      $('#repeat_update2').show()
    }

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
      enddate = $("#update_date").val().split('-')[0] + $("#update_date").val().split('-')[1] + $("#update_date").val().split('-')[2] + 'T000000Z'

    var repeat = null
    if ($("input[name=repeat4]:checked").val() === '없음') {
      repeat = 'RRULE:FREQ=' + $("select[id=repeat_update] option:selected").val() +';INTERVAL=' + $("input[id=number_update]").val()
    } else if ($("input[name=repeat4]:checked").val() === '날짜'){
      repeat = 'RRULE:FREQ=' + $("select[id=repeat_update] option:selected").val() +';INTERVAL=' + $("input[id=number_update]").val() + ';UNTIL=' + enddate
    } else if ($("input[name=repeat4]:checked").val() === '다음'){
      repeat = 'RRULE:FREQ=' + $("select[id=repeat_update] option:selected").val() +';INTERVAL=' + $("input[id=number_update]").val() + ';COUNT=' + $("input[id='update_count']").val()
    }
    if (week != '') {
      repeat += ';BYDAY='+ week
    }
    var month = ''
    if ($("select[id=repeat_update] option:selected").val() === 'MONTHLY') {
      if ($("select[id=repeat_update2] option:selected").val() === 'same_week') {
        console.log('same_week')
        // repeat += ''+month
      }
    }
    
    _repeat_option = $("select[id=repeat3] option:selected").text()
    
    if (document.getElementById('time_repeat2').checked) {
      if (_repeat_option === '매일') {
        repeat = 'RRULE:FREQ=DAILY'
      } else if (_repeat_option === '매주') {
        repeat = 'RRULE:FREQ=WEEKLY'
      } else if (_repeat_option === '매월') {
        repeat = 'RRULE:FREQ=MONTHLY'
      } else if (_repeat_option === '매년') {
        repeat = 'RRULE:FREQ=YEARLY'
      } else if (_repeat_option === '주중 매일(월-금)') {
        repeat = 'RRULE:FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR'
      }
    } else repeat = null

    if (_eventId.split('_').length === 2) {
      var requestRecurringEvent = gapi.client.calendar.events.get({
        'calendarId': 'primary',
        'eventId': _eventId.split('_')[0]
      });
      requestRecurringEvent.execute(function(resp) {
        recurrence = resp.recurrence;
        var re = recurrence[0].split(';')
        var re2 = []
        for (var i = 0; i < re.length; i++) {
          re2[i] = re[i].split('=');
          if (re2[i][0] === 'INTERVAL')
            $("#number_update").val(parseInt(re2[i][1]));
          if (re2[i][0] === 'BYDAY') {
            var w = re2[i][1].split(',')
            for (var j = 0; j < w.length; j++) {
              if (w[j] === 'MO')
                $("#MO2").val('MO').prop("checked",true);
              else if (w[j] === 'TO')
                $("#TU2").val('TU').prop("checked",true);
              else if (w[j] === 'WE')
                $("#WE2").val('WE').prop("checked",true);
              else if (w[j] === 'TH')
                $("#TH2").val('TH').prop("checked",true);
              else if (w[j] === 'FR')  
                $("#FR2").val('FR').prop("checked",true);
              else if (w[j] === 'SA')
                $("#SA2").val('SA').prop("checked",true);
              else if (w[j] === 'SU')
                $("#SU2").val('SU').prop("checked",true);
            }
          }
          if (re2[i][0] === 'UNTIL') {
            $("input:radio[name='repeat4']:radio[value='날짜']").prop('checked', true);
            var d = re2[i][1].split(''); var dd = d[0]+d[1]+d[2]+d[3]+"-"+d[4]+d[5]+"-"+d[6]+d[7]
            $("#update_date").val(dd);
          }
          else if (re2[i][0] === 'COUNT') {
            $("input:radio[name='repeat4']:radio[value='다음']").prop('checked', true);
            $("#update_count").val(re2[i][1]);
          }
        }

        if ($("select[id=repeat3] option:selected").text() === '맞춤' && document.getElementById('time_repeat2').checked === true) {
          console.log("1")
          $("#updateEvents_repeat2").show()
          //여기서도 맞춤값이 본래값과 맞지 않으면 repeat1()으로 보냄
        }
        else if (t != $('#change6').val() || l != $('#location2').val() || d != $('#description2').val() || recurrence[0] !== repeat) { //반복 바뀐 경우
          console.log("2")
          $("input[name=repeat4]:checked").removeAttr('checked');
          repeat1()
        } 
        else {
          console.log("3")
          $("input[name=repeat4]:checked").removeAttr('checked');
          $("input:radio[name='repeat5']:radio[value='모든 일정']").prop('checked', true);
          offRepeat()
          updateDisplay(repeat)
        }
      });
    } else {
      if ($("select[id=repeat3] option:selected").text() === '맞춤' && document.getElementById('time_repeat2').checked === true) {
        $("#updateEvents_repeat2").show()
      } else {
        $("input:radio[name='repeat2']:radio[value='모든 일정']").prop('checked', true);
        offRepeat()
        updateDisplay(repeat)
      }
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

  function Display(title, start, end, tstart, tend, location, description, recurrence) {
    var d = '<p>제목 | ' + title + '</p><p>'; var dd = '<p>'
    var a = ['', '', '', '', '']

    if (recurrence.length > 0) a[1] = recurrence[0][1];
    for (var i = 1; i < recurrence.length; i++) {
      if (recurrence[i][0] === 'INTERVAL')
        a[0] = recurrence[i][1]
      else if (recurrence[i][0] === 'BYDAY')
        a[2] = recurrence[i][1]
      else if (recurrence[i][0] === 'COUNT')
        a[3] = recurrence[i][1]
      else if (recurrence[i][0] === 'UNTIL')
        a[4] = recurrence[i][1]
    }
    
    if (a[0] === '' && recurrence.length > 1) a[0] = '1'
    if (a[1] === 'DAILY') a[1] = '일마다 '
    else if (a[1] === 'WEEKLY') a[1] = '주마다 '
    else if (a[1] === 'MONTHLY') a[1] = '달마다 '
    else if (a[1] === 'YEARLY') a[1] = '년마다 '

    d+= a[0] + a[1]; dd+= a[0] + a[1];
    //2TU해결하세요^^
    var a2 = a[2].split(',');
    if (a[2] != '') {
      for (var i = a2.length; i >=0 ; i--) {
        if (a2[i] === 'MO') {d+= '월 '; d+= '월 '} 
        else if (a2[i] === 'TU') {d+= '화 '; dd+= '화 '} 
        else if (a2[i] === 'WE') {d+= '수 '; dd+= '수 '} 
        else if (a2[i] === 'TH') {d+= '목 '; dd+= '목 '} 
        else if (a2[i] === 'FR') {d+= '금 '; dd+= '금 '} 
        else if (a2[i] === 'SA') {d+= '토 '; dd+= '토 '} 
        else if (a2[i] === 'SU') {d+= '일 '; dd+= '일 '} 
      }
    }
    if (a[3] != '') {d += ', ' + a[3] + '회'; dd += ', ' + a[3] + '회'}
    if (a[4] != '') {d += ', 종료일: ' + a[4]; dd += ', 종료일: ' + a[4]}
    d+= '</p>'
    document.getElementById('recurrence_update').innerHTML = dd

    if (tstart == '')
      d+='<p>' + start + '</p><p>' + end + '</p>'
    else
      d+= '<p>' + start + " " + tstart + '</p><p>' + end + " " + tend + '</p>'
    
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
            <p>
              <select id="repeat_insert2">
                <option id="same_day" value="same_day">같은 날짜</option>
                <option id="same_week" value="same_week">같은 주</option>
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
            <p><input type="radio" name="repeat2" value="날짜" />날짜<input id="insert_date" type="date"/></p>
            <p><input type="radio" name="repeat2" value="다음" />다음<input id="insert_count" type="number" min="1"/></p>
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
            <p><input id="test2" type="radio" name="repeat5" value="이 일정"/><span id="test3">이 일정</span></p>
            <p><input type="radio" name="repeat5" value="이 일정 및 향후 일정" />이 일정 및 향후 일정</p>
            <p><input type="radio" name="repeat5" value="모든 일정" />모든 일정</p>
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
            <button onClick={repeat1}>o</button>
            <p>반복 주기<input id="number_update" type="number" min="1" />
              <select id="repeat_update" onClick={repeat2}>
                <option value="DAILY">일</option>
                <option value="WEEKLY">주</option>
                <option value="MONTHLY">월</option>
                <option value="YEARLY">년</option>
              </select>
            </p>
            <p>
              <select id="repeat_update2">
                <option id="same_day" value="same_day">같은 날짜</option>
                <option id="same_week" value="same_week">같은 주</option>
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
            <p><input id="t2" type="radio" name="repeat4" value="날짜" />날짜<input id="update_date" type="date"/></p>
            <p><input id="t3" type="radio" name="repeat4" value="다음" />다음<input id="update_count" type="number" min="1"/></p>
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
            <p id="recurrence_update"></p>
            <p><input id="location2" type="text" placeholder='위치 추가'/></p>
            <p><input id="description2" type="text" placeholder='내용 추가'/></p>
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