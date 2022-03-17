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

var _title = ''; var _lastTitle = '';
var _start = ''; var _lastStart = '';
var _end = ''; var _lastEnd = '';
var _eventId = ''
var _tstart = ''
var _tend = ''
var _location = ''; var _description = '';
var _repeat = ''
var _repeat_option = ''
var _r = false
var update_what = 0;
var update_repeat = null;
var update_recurrence = ['', '', '', '', ''];

function App() {
  // console.table(getMonth(3))
  const [loggedIn, setLoggedIn] = useState(false);

  var gapi = window.gapi
  var CLIENT_ID = "88262564393-247auf0fs74d92pggmbm5nfmprp6mesb.apps.googleusercontent.com"
  var API_KEY = "AIzaSyBuloUS31QvT13Wmz0HdmKA08Y4m3wTN5Y"
  var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"]
  // var SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
  var SCOPES = "https://www.googleapis.com/auth/calendar.events"

  //달력 생성하기
  function changeCalendar(change_events) {
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

      onDisplay()
      //값 바뀔때마다 바꿔줌
      title('', '')
      startDate('', event.dateStr)
      endDate('', event.dateStr)
      startTime('', '')
      endTime('', '')

      //제목, 시작, 끝, 지역, 내용 초기화
      $('#insertEvents_title').val('')
      $('#insertEvents_startDate').val(event.dateStr)
      $('#insertEvents_endDate').val(event.dateStr)
      $('#insertEvents_startTime').val(_tstart)
      $('#insertEvents_endTime').val(_tend)
      $('#insertEvents_location').val('')
      $('#insertEvents_description').val('')

      //맞춤 초기화
      $("#insertEvents_repeatNumber").val(1); $("#insertEvents_repeatDWMY").val("DAILY").prop('selected', true);
      
      $("#insertEvents_repeatM").val("same_day").prop('selected', true);
      $("input:radio[name='insertEvents_repeatLast']:radio[value='없음']").prop('checked', true);
      $("#insertEvents_repeatLastDate").val(makeYear($('#insertEvents_startDate').val()));
      $("#insertEvents_repeatLastCount").val(1);
      
      //시간, 반복 초기화
      $("#insertEvents_repeatDate").val('매일').prop("selected",true);
      document.getElementById('insertEvents_timeCheck').checked = false
      document.getElementById('insertEvents_repeatCheck').checked = false
      $("#insertEvents_repeatDate").hide()
      $("#insertEvents_startTime").hide()
      $("#insertEvents_endTime").hide()
    },
    eventClick:function(event) {
      _r = false; update_what = 0; update_repeat = null; update_recurrence = null; update_recurrence = ['', '', '', '', ''];
      var mainStart = event.event.startStr; var mainEnd = event.event.endStr;
      // _lastTitle = event.event._def.title; _lastStart = mainStart; _lastEnd = mainEnd;
      var cstart = ''; var cend = ''; var tstart = ''; var tend = '';

      if (mainStart !== mainEnd && mainEnd.length < 11){
        if (mainEnd === "")
          cend = mainStart;
        else
          cend = makeYesterday(mainEnd);
        cstart = mainStart; 
      } else{
        cstart = mainStart.substring(0, 10)
        cend = mainEnd.substring(0, 10)
        tstart = mainStart.substring(11, 16)
        tend = mainEnd.substring(11, 16)
      }
      //값 바뀔때마다 바꿔줌
      title('', event.event._def.title)
      startDate('', cstart)
      endDate('', cend)
      eventId(event.event._def.publicId)
      startTime('', tstart)
      endTime('', tend)

      _location = event.event._def.extendedProps.location;
      _description = event.event._def.extendedProps.description;
      if (_location === undefined) _location = '';
      if (_description === undefined) _description = '';

      //제목 시작 끝 시간 지역 초기화
      $('#updateEvents_title').val(event.event._def.title)
      $('#updateEvents_startDate').val(cstart)
      $('#updateEvents_endDate').val(cend)
      $('#updateEvents_startTime').val(tstart)
      $('#updateEvents_endTime').val(tend)
      $('#updateEvents_location').val(_location)
      $('#updateEvents_description').val(_description)

      //시간 반복 초기화
      $("#updateEvents_repeatDate").val('매일').prop("selected",true); //나중에 바뀜
      //시간 반복 체크여부
      if (tstart != '') {
        document.getElementById('updateEvents_timeCheck').checked = true
        $('#updateEvents_startTime').show()
        $('#updateEvents_endTime').show()
      } else {
        document.getElementById('updateEvents_timeCheck').checked = false
        $('#updateEvents_startTime').hide()
        $('#updateEvents_endTime').hide()
      }
      if (event.event._def.extendedProps.recurring != undefined) {
        document.getElementById('updateEvents_repeatCheck').checked = true
        _r = true
        $('#updateEvents_repeatDate').show();
      } else {
        document.getElementById('updateEvents_repeatCheck').checked = false
        $('#updateEvents_repeatDate').hide()
      }

      //맞춤 초기화
      $("#updateEvents_repeatNumber").val(1); $("#updateEvents_repeatDWMY").val("DAILY").prop('selected', true);
      //
      $("#updateEvents_repeatW").hide();$("#updateEvents_repeatW1").hide();$("#updateEvents_repeatW2").hide();$("#updateEvents_repeatW3").hide();$("#updateEvents_repeatW4").hide();$("#updateEvents_repeatW5").hide();$("#updateEvents_repeatW6").hide();$("#updateEvents_repeatW7").hide();
      $("#MO2").val('MO').prop("checked",false); $("#MO2").hide();
      $("#TU2").val('TU').prop("checked",false); $("#TU2").hide();
      $("#WE2").val('WE').prop("checked",false); $("#WE2").hide();
      $("#TH2").val('TH').prop("checked",false); $("#TH2").hide();
      $("#FR2").val('FR').prop("checked",false); $("#FR2").hide();
      $("#SA2").val('SA').prop("checked",false); $("#SA2").hide();
      $("#SU2").val('SU').prop("checked",false); $("#SU2").hide();
      $('#updateEvents_repeatM').hide();
      //
      $("#updateEvents_repeatM").val("same_day").prop('selected', true);
      $("input:radio[name='updateEvents_repeatLast']:radio[value='없음']").prop('checked', true);
      $("#updateEvents_repeatLastDate").val(makeYear($('#updateEvents_startDate').val()));
      $("#updateEvents_repeatLastCount").val(1);

      const element = document.getElementById('mainEvents_contents')
      if (event.event._def.publicId.split('_').length === 2) {
        var requestRecurringEvent = gapi.client.calendar.events.get({
          'calendarId': 'primary',
          'eventId': event.event._def.publicId.split('_')[0]
        });
        requestRecurringEvent.execute(function(resp) {
          //recurrence 배열 만들기
          recurrence = resp.recurrence[0];
          var re = recurrence.split(';'); var re2 = [];
          for (var i = 0; i < re.length; i++) {
            re2[i] = re[i].split('=');
          }
          //맞춤 초기화2
          if (re.length == 2 && re2[0][1] === 'MONTHLY')
            $("#updateEvents_repeatDate").val('매월').prop("selected",true);
          else if (re.length > 1) {
            $("#updateEvents_repeatDate").val('맞춤').prop("selected",true);
            $("#updateEvents_repeatDWMY").val(re2[0][1]).prop("selected",true);
          }
          else if (re2[0][1] === 'DAILY')
            $("#updateEvents_repeatDate").val('매일').prop("selected",true);
          else if (re2[0][1] === 'WEEKLY')
            $("#updateEvents_repeatDate").val('매주').prop("selected",true);
          else if (re2[0][1] === 'MONTHLY')
            $("#updateEvents_repeatDate").val('매월').prop("selected",true);
          else if (re2[0][1] === 'YEARLY')
            $("#updateEvents_repeatDate").val('매년').prop("selected",true);
          
          var a = [re2[0][1], '', '', '', '']; update_recurrence[0] = re2[0][1];
          if(a[1] === '') a[1] = '1';
          for (var i = 1; i < re2.length; i++) {
            if (re2[i][0] === 'INTERVAL'){
              a[1] = re2[i][1]; update_recurrence[1] = re2[i][1];
            }
            else if (re2[i][0] === 'BYDAY'){
              a[2] = re2[i][1]; update_recurrence[2] = re2[i][1];
            }
            else if (re2[i][0] === 'COUNT'){
              a[3] = re2[i][1]; update_recurrence[3] = re2[i][1];
            }
            else if (re2[i][0] === 'UNTIL'){
              a[4] = re2[i][1]; update_recurrence[4] = re2[i][1];
            }
          }

          if (a[1] != 1)
            $("#updateEvents_repeatNumber").val(a[1]);
          if (a[2] != '') {
            var byday = ''; var a2 = a[2].split(',');
            //월 초기화
            if (a2.length === 1)
              if (a2[0].split("").length === 3) {
                $("#updateEvents_repeatM").val("same_week").prop('selected', true);
                byday += a2[0].split("")[0];
              }
              
            //주 초기화
            for (var i = a2.length-1; i >=0 ; i--) {
              if (a2[i].slice(-2) === 'MO') { byday+= '월요일, '; $("#MO2").val('MO').prop("checked", true); }
              else if (a2[i].slice(-2) === 'TU') { byday+= '화요일, '; $("#TU2").val('TU').prop("checked", true); }
              else if (a2[i].slice(-2) === 'WE') { byday+= '수요일, '; $("#WE2").val('WE').prop("checked", true); }
              else if (a2[i].slice(-2) === 'TH') { byday+= '목요일, '; $("#TH2").val('TH').prop("checked", true); }
              else if (a2[i].slice(-2) === 'FR') { byday+= '금요일, '; $("#FR2").val('FR').prop("checked", true); }
              else if (a2[i].slice(-2) === 'SA') { byday+= '토요일, '; $("#SA2").val('SA').prop("checked", true); }
              else if (a2[i].slice(-2) === 'SU') { byday+= '일요일, '; $("#SU2").val('SU').prop("checked", true); }
            }
            byday = byday.slice(0, -1); byday = byday.slice(0, -1);
            a[2] = byday;
          }
          if (a[3] != '') {
            $("input:radio[name='updateEvents_repeatLast']:radio[value='다음']").prop('checked', true);
            $("#updateEvents_repeatLastCount").val(a[3]);
          }
          else if (a[4] != '') {
            $("input:radio[name='updateEvents_repeatLast']:radio[value='날짜']").prop('checked', true);
            var a4 = a[4].split(''); a[4] = a4[0]+a4[1]+a4[2]+a4[3]+"-"+a4[4]+a4[5]+"-"+a4[6]+a4[7];
            $("#updateEvents_repeatLastDate").val(a[4]);
          }

          element.innerHTML = Display(event.event._def.title, cstart, cend, tstart, tend, _location, _description, a)
        });
      } else {
        element.innerHTML = Display(event.event._def.title, cstart, cend, tstart, tend, _location, _description, [])
      }
      onDisplayM()
    },
    });

    calendar.render();
  }



  function title(e, title) {
    if ('' === e)
      _title = title
    else
      _title = e.target.value
  }
  function startDate(e, start) {
    if ('' === e)
      _start = start
    else
      _start = e.target.value
  }
  function endDate(e, end) {
    if ('' === e)
      _end = end
    else
      _end = e.target.value
  }

  function eventId(eventId) {
    _eventId = eventId
  }
  function startTime(e, tstart) {
    if ('' === e)
      _tstart = tstart
    else
      _tstart = e.target.value
  }
  function endTime(e, tend) {
    if ('' === e)
      _tend = tend
    else
      _tend = e.target.value
  }



  //시간 조정하기
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



  //로그아웃
  const LoginOut = () => {
    gapi.auth.signOut(
      console.log('logout'),
      setLoggedIn(false),
    )
    changeCalendar([])
  }
  //로그인
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



  //이벤트 만들기
  function makeEvent(title, start, end, location, description, recurrence) {
    if (start.length > 10) {
      return {
        'summary': title,
        'location': location, 
        'description': description,
        'start': {
          'dateTime': start,
          'timeZone': 'Asia/Dili'
        },
        'end': {
          'dateTime': end,
          'timeZone': 'Asia/Dili'
        },
        'recurrence': [
          recurrence
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
      return {
        'summary': title,
        'location': location, 
        'description': description,
        'start': {
          'date': start,
        },
        'end': {
          'date': end,
        },
        'recurrence': [
          recurrence
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
  }
  function makeUNTIL(recurrence) {
    var u = true
    var fday = makeYesterday($('#updateEvents_startDate').val())
    fday = fday.split("")[0] + fday.split("")[1] + fday.split("")[2] + fday.split("")[3] + fday.split("")[5] + fday.split("")[6] + fday.split("")[8] + fday.split("")[9];
    var re = recurrence.split(';'); var re2 = []
    recurrence = ''
    for (var i = 0; i < re.length; i++) re2[i] = re[i].split('=');
    for (var i = 0; i < re2.length; i++) {
      if (re2[i][0] === 'UNTIL') {
        u = false
        re2[i][1] = fday + 'T000000Z';
      }
      recurrence += re2[i][0] + "=" + re2[i][1] + ";"
    }
    if (u) recurrence += "UNTIL" + "=" + fday + "T000000Z"
    return recurrence;
  }
  function timeCorrect(start, end, tstart, tend) {
    if (start === end){
      if (tstart[0]+tstart[1] > tend[0]+tend[1]) {
        alert('시간 설정이 잘못되었습니다.')
        return false
      }
      else if (tstart[0]+tstart[1] === tend[0]+tend[1]) {
        if (tstart[3]+tstart[4] > tend[3]+tend[4]) {
          alert('시간 설정이 잘못되었습니다.')
          return false
        }
      }
    }
    return true
  }

  //추가
  function InsertEventsF(title, start, end, tstart, tend) {
    if (timeCorrect(start, end, tstart, tend) && tstart != '' && tend != '') return;
    
    var week = ''
    if ($("select[id=insertEvents_repeatDWMY] option:selected").val() === 'MONTHLY') {
      if ($("select[id=insertEvents_repeatM] option:selected").val() === 'same_week') {
        var week_all = new Array('SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA');
        var today = new Date($('#insertEvents_startDate').val()).getDay();
        var day = week_all[today];
        console.log(day)
        var date = new Date($('#insertEvents_startDate').val());
        console.log(Math.ceil(date.getDate() / 7))
        week += Math.ceil(date.getDate() / 7) + day
      }
    }
    if ($("select[id=insertEvents_repeatDWMY] option:selected").val() === 'WEEKLY') {
      if (document.getElementById('SU').checked) week += 'SU,'
      if (document.getElementById('SA').checked) week += 'SA,'
      if (document.getElementById('FR').checked) week += 'FR,'
      if (document.getElementById('TH').checked) week += 'TH,'
      if (document.getElementById('WE').checked) week += 'WE,'
      if (document.getElementById('TU').checked) week += 'TU,'
      if (document.getElementById('MO').checked) week += 'MO,'
      week = week.slice(0, -1)
    }

    var enddate = ''
    if ($("input[name=insertEvents_repeatLast]:checked").val() === '날짜')
      enddate = $("#insertEvents_repeatLastDate").val().split('-')[0] + $("#insertEvents_repeatLastDate").val().split('-')[1] + $("#insertEvents_repeatLastDate").val().split('-')[2] + 'T000000Z'

    var repeat = null
    if ($("input[name=insertEvents_repeatLast]:checked").val() === '없음') {
      repeat = 'RRULE:FREQ=' + $("select[id=insertEvents_repeatDWMY] option:selected").val() +';INTERVAL=' + $("input[id=insertEvents_repeatNumber]").val() + ';'
    } else if ($("input[name=insertEvents_repeatLast]:checked").val() === '날짜'){
      repeat = 'RRULE:FREQ=' + $("select[id=insertEvents_repeatDWMY] option:selected").val() +';INTERVAL=' + $("input[id=insertEvents_repeatNumber]").val() + ';UNTIL=' + enddate + ';'
    } else if ($("input[name=insertEvents_repeatLast]:checked").val() === '다음'){
      repeat = 'RRULE:FREQ=' + $("select[id=insertEvents_repeatDWMY] option:selected").val() +';INTERVAL=' + $("input[id=insertEvents_repeatNumber]").val() + ';COUNT=' + $("input[id='insertEvents_repeatLastCount']").val() + ';'
    }
    if (week != '') {
      repeat += 'BYDAY='+ week +';'
    }
    
    _repeat_option = $("select[id=insertEvents_repeatDate] option:selected").text()
    
    if (document.getElementById('insertEvents_repeatCheck').checked) {
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
    if (tstart != '' && document.getElementById('insertEvents_timeCheck').checked === true) {
      start = start + 'T' + tstart + ':00+09:00'
      end = end + 'T' + tend + ':00+09:00'
    } 

    event = makeEvent(title, start, end, $('#insertEvents_location').val(), $('#insertEvents_description').val(), repeat)
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
  //업데이트
  function updateEventsF(title, start, end, eventId, tstart, tend, event) {
    if (timeCorrect(start, end, tstart, tend) && tstart != '' && tend != '') return;
    // makeEvent(title, start, end, location, description, recurrence) //location => _location, $('#updateEvents_location').val()
    
    var request = gapi.client.calendar.events.update({
      'calendarId': 'primary',
      'eventId': eventId,
      'resource': event
    });
    request.execute(function(event) {
    })
    loadCalendarApi()
    $('#updateEvents').hide()
    offRepeat()
  }
  //삭제
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

  //창추가
  function insertDisplay() {
    if ( _tstart == '')
      InsertEventsF(_title, _start, makeTomorrow(_end), _tstart, _tend)
    else 
      InsertEventsF(_title, _start, _end, _tstart, _tend)
  }
  //창업데이트
  function updateDisplay() {
    console.log('updateDisplay')
    var event = ''
    _repeat_how = $("input[name=updateEvents_repeat2Repeat]:checked").val()

    var requestRecurringEvent = gapi.client.calendar.events.get({
      'calendarId': 'primary',
      'eventId': _eventId.split('_')[0]
    });
    requestRecurringEvent.execute(function(resp) {
      if (_repeat_how === "모든 일정") {
        _eventId = _eventId.split('_')[0]
        event = makeEvent(_title, _start, _end, $('#updateEvents_location').val(), $('#updateEvents_description').val(), update_repeat) //location => _location, $('#updateEvents_location').val()
      } else if (_repeat_how === "이 일정" && _eventId.split('_')[1] != undefined) {
        event = makeEvent(_title, _start, _end, $('#updateEvents_location').val(), $('#updateEvents_description').val(), null)
      } else if (_repeat_how === "이 일정 및 향후 일정" && _eventId.split('_')[1] != undefined) { //나중에 수정하세요
        //업데이트
        _eventId = _eventId.split('_')[0];
        event = makeEvent(resp.summary, resp.start.date, resp.end.date, _location, _description, makeUNTIL(resp.recurrence[0])); //_start, _end 모두 과거로 가져오기
        //추가
        var request = gapi.client.calendar.events.insert({
          'calendarId': 'primary',
          'resource': makeEvent(_title, _start, _end, $('#updateEvents_location').val(), $('#updateEvents_description').val(), update_repeat),
        })
        request.execute(function(event) {
        })
        loadCalendarApi()
      } else {
        _eventId = _eventId.split('_')[0];
        event = makeEvent(_title, _start, _end, $('#updateEvents_location').val(), $('#updateEvents_description').val(), update_repeat);
      }
      updateEventsF(_title, _start, _end, _eventId, _tstart, _tend, event)
    });
  }
  //창삭제
  function deleteDisplay() {
    _repeat_how = $("input[name=deleteEvents_repeat2Repeat]:checked").val()
    if (_repeat_how === "모든 일정") {
      _eventId = _eventId.split('_')[0]
    } else if (_repeat_how === "이 일정" && _eventId.split('_')[1] != undefined) {
      _eventId = _eventId.split('_')[0]+"_"+_eventId.split('_')[1]
    } else if (_repeat_how === "이 일정 및 향후 일정" && _eventId.split('_')[1] != undefined) { //나중에 수정하세요
      /* 이 일정 및 향후 일정 삭제 = 수정해야함 */
      $("input[name=updateEvents_repeatLast]:checked").removeAttr('checked');
      var requestRecurringEvent = gapi.client.calendar.events.get({
        'calendarId': 'primary',
        'eventId': _eventId.split('_')[0],
      });
      requestRecurringEvent.execute(function(resp) {

        var event = ''
        if (resp.start.date != undefined)
          event = makeEvent(resp.summary, resp.start.date, resp.end.date, resp.location, resp.description, makeUNTIL(resp.recurrence[0]))
        else
          event = makeEvent(resp.summary, resp.start.dateTime, resp.end.dateTime, resp.location, resp.description, makeUNTIL(resp.recurrence[0]))

        var request = gapi.client.calendar.events.update({
          'calendarId': 'primary',
          'eventId': _eventId.split('_')[0],
          'resource': event,
        });
        request.execute(function(event) {
        })
        loadCalendarApi()
      });

    } else {
      _eventId = _eventId.split('_')[0]
    }
    deleteEventsF(_eventId)
  }

  //반복 추가
  function insertEvents_repeatF() {
    //주:요일체크
    var week = new Array('SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA');
    var today = new Date($('#insertEvents_startDate').val()).getDay();
    var day = week[today];
    $("#insertEvents_repeatW").hide();$("#insertEvents_repeatW1").hide();$("#insertEvents_repeatW2").hide();$("#insertEvents_repeatW3").hide();$("#insertEvents_repeatW4").hide();$("#insertEvents_repeatW5").hide();$("#insertEvents_repeatW6").hide();$("#insertEvents_repeatW7").hide();
    $("#MO").val('MO').prop("checked",false); $("#MO").hide();
    $("#TU").val('TU').prop("checked",false); $("#TU").hide();
    $("#WE").val('WE').prop("checked",false); $("#WE").hide();
    $("#TH").val('TH').prop("checked",false); $("#TH").hide();
    $("#FR").val('FR').prop("checked",false); $("#FR").hide();
    $("#SA").val('SA').prop("checked",false); $("#SA").hide();
    $("#SU").val('SU').prop("checked",false); $("#SU").hide();
    $('#insertEvents_repeatM').hide();
    //W보이기
    if ($("select[id=insertEvents_repeatDWMY] option:selected").text() === '주') {
      $("#insertEvents_repeatW").show();$("#insertEvents_repeatW1").show();$("#insertEvents_repeatW2").show();$("#insertEvents_repeatW3").show();$("#insertEvents_repeatW4").show();$("#insertEvents_repeatW5").show();$("#insertEvents_repeatW6").show();$("#insertEvents_repeatW7").show();
      $("#MO").show();$("#TU").show();$("#WE").show();$("#TH").show();$("#FR").show();$("#SA").show();$("#SU").show();
      $("#"+ day).val(day).prop("checked",true);
    }
    //M보이기
    if ($("select[id=insertEvents_repeatDWMY] option:selected").text() === '월') {
      $('#insertEvents_repeatM').show()
    }

    if ($("select[id=insertEvents_repeatDate] option:selected").text() === '맞춤') {
      console.log('insert1')
      $("#insertEvents_repeat").show()
    } else {
      console.log('insert2')
      $("input[name=insertEvents_repeatLast]:checked").removeAttr('checked');
      offRepeat()
      insertDisplay()
    }
  }
  function updateEvents_repeatF() {
    $("#updateEvents_repeatW").hide();$("#updateEvents_repeatW1").hide();$("#updateEvents_repeatW2").hide();$("#updateEvents_repeatW3").hide();$("#updateEvents_repeatW4").hide();$("#updateEvents_repeatW5").hide();$("#updateEvents_repeatW6").hide();$("#updateEvents_repeatW7").hide();
    $("#MO2").hide(); $("#TU2").hide(); $("#WE2").hide(); $("#TH2").hide(); $("#FR2").hide(); $("#SA2").hide(); $("#SU2").hide();
    $('#updateEvents_repeatM').hide();

    if ($("select[id=updateEvents_repeatDWMY] option:selected").text() === '주') {
      $("#updateEvents_repeatW").show();$("#updateEvents_repeatW1").show();$("#updateEvents_repeatW2").show();$("#updateEvents_repeatW3").show();$("#updateEvents_repeatW4").show();$("#updateEvents_repeatW5").show();$("#updateEvents_repeatW6").show();$("#updateEvents_repeatW7").show();
      $("#MO2").show();$("#TU2").show();$("#WE2").show();$("#TH2").show();$("#FR2").show();$("#SA2").show();$("#SU2").show();
    }
    if ($("select[id=updateEvents_repeatDWMY] option:selected").text() === '월') {
      $('#updateEvents_repeatM').show()
    }

    if (_r) {
      update_what = 1;
      if ($("select[id=updateEvents_repeatDate] option:selected").text() === '맞춤' && document.getElementById('updateEvents_repeatCheck').checked === true) {
        console.log("맞춤->맞춤")
        $('#updateEvents_repeat').show()
      } else {
        console.log("반복->맞춤")
        updateEvents_repeat2F()
      }
    } else {
      update_what = 2;
      if ($("select[id=updateEvents_repeatDate] option:selected").text() === '맞춤' && document.getElementById('updateEvents_repeatCheck').checked === true) {
        console.log("일반->맞춤")
        $('#updateEvents_repeat').show()
      }
      else {
        console.log("일반->일반,반복")
        $("input:radio[name='updateEvents_repeat2Repeat']:radio[value='모든 일정']").prop('checked', true);
        offRepeat()
        updateDisplay()
      }
    }    
  }
  function updateEvents_repeat2F() {
    if (_eventId.split('_').length === 2) {
      var week = new Array('SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA');
      var today = new Date($('#updateEvents_startDate').val()).getDay();
      var day = week[today];
      var month = ''; var week = '';
      if ($("select[id=updateEvents_repeatDWMY] option:selected").val() === 'WEEKLY' || ($("select[id=updateEvents_repeatDWMY] option:selected").val() === 'MONTHLY' && $("select[id=updateEvents_repeatM] option:selected").val() === 'same_week')) {
        $("#"+ day+"2").val(day).prop("checked",true);
        if ($("select[id=updateEvents_repeatM] option:selected").val() === 'same_week') {
          month = new Date($('#updateEvents_startDate').val());
          month = Math.ceil(month.getDate() / 7)
        }
      
        week += month
        if (document.getElementById('SU2').checked) week += 'SU,'
        if (document.getElementById('SA2').checked) week += 'SA,'
        if (document.getElementById('FR2').checked) week += 'FR,'
        if (document.getElementById('TH2').checked) week += 'TH,'
        if (document.getElementById('WE2').checked) week += 'WE,'
        if (document.getElementById('TU2').checked) week += 'TU,'
        if (document.getElementById('MO2').checked) week += 'MO,'
        week = week.slice(0, -1)
      }

      var enddate = ''
      if ($("input[name=updateEvents_repeatLast]:checked").val() === '날짜')
        enddate = $("#updateEvents_repeatLastDate").val().split('-')[0] + $("#updateEvents_repeatLastDate").val().split('-')[1] + $("#updateEvents_repeatLastDate").val().split('-')[2] + 'T000000Z'

      var b = ['', '', '', '', ''];
      if ($("select[id=updateEvents_repeatDate] option:selected").text() === '맞춤') {
        b[0] = $("select[id=updateEvents_repeatDWMY] option:selected").val(); b[1] = '1';
      }
      else if ($("select[id=updateEvents_repeatDate] option:selected").text() === '매일')
        b[0] = 'DAILY'
      else if ($("select[id=updateEvents_repeatDate] option:selected").text() === '매주')
        b[0] = 'WEEKLY'
      else if ($("select[id=updateEvents_repeatDate] option:selected").text() === '매월')
        b[0] = 'MONTHLY'
      if ($("select[id=updateEvents_repeatDate] option:selected").text() === '매년')
        b[0] = 'YEARLY'
      
      if ($("input[id=updateEvents_repeatNumber]").val() != '1') b[1] = $("input[id=updateEvents_repeatNumber]").val();
      b[2] = week;
      if ($("input[name=updateEvents_repeatLast]:checked").val() === '없음') {
        update_repeat = 'RRULE:FREQ=' + $("select[id=updateEvents_repeatDWMY] option:selected").val() +';INTERVAL=' + $("input[id=updateEvents_repeatNumber]").val()
      } else if ($("input[name=updateEvents_repeatLast]:checked").val() === '날짜'){
        b[4] = enddate;
        update_repeat = 'RRULE:FREQ=' + $("select[id=updateEvents_repeatDWMY] option:selected").val() +';INTERVAL=' + $("input[id=updateEvents_repeatNumber]").val() + ';UNTIL=' + enddate
      } else if ($("input[name=updateEvents_repeatLast]:checked").val() === '다음'){
        b[3] = $("input[id='updateEvents_repeatLastCount']").val(); 
        update_repeat = 'RRULE:FREQ=' + $("select[id=updateEvents_repeatDWMY] option:selected").val() +';COUNT=' + $("input[id='updateEvents_repeatLastCount']").val() +';INTERVAL=' + $("input[id=updateEvents_repeatNumber]").val()
      }
      if (week != '') {
        update_repeat += ';BYDAY='+ week
      }
      
      _repeat_option = $("select[id=updateEvents_repeatDate] option:selected").text()
      
      if (document.getElementById('updateEvents_repeatCheck').checked) {
        if (_repeat_option === '매일') {
          update_repeat = 'RRULE:FREQ=DAILY'
        } else if (_repeat_option === '매주') {
          update_repeat = 'RRULE:FREQ=WEEKLY'
        } else if (_repeat_option === '매월') {
          update_repeat = 'RRULE:FREQ=MONTHLY'
        } else if (_repeat_option === '매년') {
          update_repeat = 'RRULE:FREQ=YEARLY'
        } else if (_repeat_option === '주중 매일(월-금)') {
          update_repeat = 'RRULE:FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR'
        }
      } else update_repeat = null

      var update_recurrenceRepeat = false
      for (var i = 0; i < 5; i++)
        if (update_recurrence[i] != b[i]) update_recurrenceRepeat = true
      //갑자기 체크된다..?
      console.log(update_recurrence)
      console.log(b)

      if (update_recurrenceRepeat) {
        console.log('이 일정 및 향후 일정')
        $("input:radio[name='updateEvents_repeat2Repeat']:radio[value='이 일정 및 향후 일정']").prop('checked', true);
        $('#test2').hide(); $('#test3').hide();
        $('#updateEvents_repeat2').show()
      } else if (_lastTitle != _title || _location != $('#updateEvents_location').val() || _description != $('#updateEvents_description').val()) {
        console.log('이 일정')
        $("input:radio[name='updateEvents_repeat2Repeat']:radio[value='이 일정']").prop('checked', true);
        $('#updateEvents_repeat2').show()
      } else {
        console.log('바뀐 것 없음')
        $("input:radio[name='updateEvents_repeat2Repeat']:radio[value='모든 일정']").prop('checked', true);
        offRepeat()
        updateDisplay()
      }
      
    } else {
      $("input:radio[name='updateEvents_repeat2Repeat']:radio[value='모든 일정']").prop('checked', true);
      offRepeat()
      updateDisplay()
    }
  }
  function deleteEvents_repeat2F() {
    $("input:radio[name='deleteEvents_repeat2Repeat']:radio[value='이 일정']").prop('checked', true);
    var test = document.getElementById('updateEvents_repeatCheck').checked
    if (test === true) {
      $("#deleteEvents_repeat2").show()
      // _repeat_option = $("select[id=repeat2] option:selected").text()
    } else {
      offRepeat()
      deleteDisplay()
    }
  }

  //메인창 추가
  function Display(title, start, end, tstart, tend, location, description, a) {
    var d = '<p>제목 | ' + title + '</p><p>';

    // DWMY, INTERVAL, BYDAY, COUNT, UNTIL
    if (a.length > 1) {
      if (a[0] === 'DAILY') a[0] = '일마다 '
      else if (a[0] === 'WEEKLY') a[0] = '주마다 '
      else if (a[0] === 'MONTHLY') a[0] = '달마다 '
      else if (a[0] === 'YEARLY') a[0] = '년마다 '

      if (a[3] != '') {a[3] = ', ' + a[3] + '회'; }
      if (a[4] != '') {a[4] = ', 종료일: ' + a[4]; }

      d += a[1] + a[0] + a[2] + a[3] + a[4] + '</p>'
    } else {
      d += '</p>'
    }
    
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
  //창
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
    $('#updateEvents_repeat2').hide()
    $('#updateEvents_repeat').hide()
    $('#deleteEvents_repeat2').hide()
  }

  function insertEvents_timeCheck() {
    var test = document.getElementById('insertEvents_timeCheck').checked
    if (test === false) {
      $('#insertEvents_startTime').hide()
      $('#insertEvents_endTime').hide()
    } else {
      $('#insertEvents_startTime').show()
      $('#insertEvents_endTime').show()
    }
  }
  function insertEvents_repeatCheck() {
    var test = document.getElementById('insertEvents_repeatCheck').checked
    if (test === false) 
      $('#insertEvents_repeatDate').hide()
    else 
      $('#insertEvents_repeatDate').show()
  }

  function updateEvents_timeCheck() {
    var test = document.getElementById('updateEvents_timeCheck').checked
    if (test === false) {
      $('#updateEvents_startTime').hide()
      $('#updateEvents_endTime').hide()
    } else {
      $('#updateEvents_startTime').show()
      $('#updateEvents_endTime').show()
    }
  }
  function updateEvents_repeatCheck() {
    var test = document.getElementById('updateEvents_repeatCheck').checked
    if (test === false) 
      $('#updateEvents_repeatDate').hide()
    else 
      $('#updateEvents_repeatDate').show()
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
          {/* insertEvents_repeat */}
          <div id="insertEvents_repeat" style={insertStyle_repeat}>
            <button onClick={offRepeat}>x</button>
            <button onClick={insertDisplay}>o</button>
            <p>반복 주기<input id="insertEvents_repeatNumber" type="number" min="1" />
              <select id="insertEvents_repeatDWMY" onClick={insertEvents_repeatF}>
                <option value="DAILY">일</option>
                <option value="WEEKLY">주</option>
                <option value="MONTHLY">월</option>
                <option value="YEARLY">년</option>
              </select>
            </p>
            <p id="insertEvents_repeatW">반복 요일</p>
            <p>
              <input id="MO" type="checkbox" value="MO"/><span id="insertEvents_repeatW1">월</span>
              <input id="TU" type="checkbox" value="TU"/><span id="insertEvents_repeatW2">화</span>
              <input id="WE" type="checkbox" value="WE"/><span id="insertEvents_repeatW3">수</span>
              <input id="TH" type="checkbox" value="TH"/><span id="insertEvents_repeatW4">목</span>
              <input id="FR" type="checkbox" value="FR"/><span id="insertEvents_repeatW5">금</span>
              <input id="SA" type="checkbox" value="SA"/><span id="insertEvents_repeatW6">토</span>
              <input id="SU" type="checkbox" value="SU"/><span id="insertEvents_repeatW7">일</span>
            </p>
            <p>
              <select id="insertEvents_repeatM">
                <option id="insertEvents_repeatM1" value="same_day">같은 날짜</option>
                <option id="insertEvents_repeatM2" value="same_week">같은 주</option>
              </select>
            </p>
            <p>종료</p>
            <p><input id="insertEvents_repeatLast1" type="radio" name="insertEvents_repeatLast" value="없음"/>없음</p>
            <p><input id="insertEvents_repeatLast2" type="radio" name="insertEvents_repeatLast" value="날짜" />날짜<input id="insertEvents_repeatLastDate" type="date"/></p>
            <p><input id="insertEvents_repeatLast3" type="radio" name="insertEvents_repeatLast" value="다음" />다음<input id="insertEvents_repeatLastCount" type="number" min="1"/></p>
          </div>
          {/* insertEvents */}
          <div id='insertEvents' style={insertStyle}>
            <button onClick={offDisplay}>x</button>
            <button onClick={insertEvents_repeatF}>o</button>
            <p><input id="insertEvents_title" name="text" placeholder='(제목 및 시간 추가)' onChange={title} /></p>
            <p><input type="date" id="insertEvents_startDate" name="text" onChange={startDate} /><input type="time" id="insertEvents_startTime" name="text" onChange={startTime} /></p>
            <p><input type="date" id="insertEvents_endDate" name="text" onChange={endDate} /><input type="time" id="insertEvents_endTime" name="text" onChange={endTime} /></p>
            <p><input id="insertEvents_timeCheck" type="checkbox" onChange={insertEvents_timeCheck} /></p>
            <p>
              <input id="insertEvents_repeatCheck" type="checkbox" onChange={insertEvents_repeatCheck} />
              <select id="insertEvents_repeatDate">
                <option value="매일">매일</option>
                <option value="매주">매주</option>
                <option value="매월">매월</option>
                <option value="매년">매년</option>
                <option value="주중_매일(월-금)">주중 매일(월-금)</option>
                <option value="맞춤">맞춤</option>
              </select>
            </p>
            <p><input id="insertEvents_location" type="text" placeholder='위치 추가'/></p>
            <p><input id="insertEvents_description" type="text" placeholder='내용 추가'/></p>
          </div>


          {/* mainEvents */}
          <div id='mainEvents' style={insertStyle}>
            <button onClick={offDisplayM}>x</button>
            <button onClick={onDisplayU}>update</button>
            <div id='mainEvents_contents'></div>
          </div>

          {/* updateEvents_repeat2 */}
          <div id="updateEvents_repeat2" style={insertStyle_repeat2}>
            <button onClick={offRepeat}>x</button>
            <button onClick={updateDisplay}>o</button>
            <p><input id="test2" type="radio" name="updateEvents_repeat2Repeat" value="이 일정"/><span id="test3">이 일정</span></p>
            <p><input type="radio" name="updateEvents_repeat2Repeat" value="이 일정 및 향후 일정" />이 일정 및 향후 일정</p>
            <p><input type="radio" name="updateEvents_repeat2Repeat" value="모든 일정" />모든 일정</p>
          </div>
          {/* deleteEvents_repeat2 */}
          <div id="deleteEvents_repeat2" style={insertStyle_repeat}>
            <button onClick={offRepeat}>x</button>
            <button onClick={deleteDisplay}>o</button>
            <p><input id="test1" type="radio" name="deleteEvents_repeat2Repeat" value="이 일정"/>이 일정</p>
            <p><input type="radio" name="deleteEvents_repeat2Repeat" value="이 일정 및 향후 일정" />이 일정 및 향후 일정</p>
            <p><input type="radio" name="deleteEvents_repeat2Repeat" value="모든 일정" />모든 일정</p>
          </div>

          {/* updateEvents_repeat */}
          <div id="updateEvents_repeat" style={insertStyle_repeat}>
            <button onClick={offRepeat}>x</button>
            <button onClick={updateEvents_repeat2F}>o</button>
            <p>반복 주기<input id="updateEvents_repeatNumber" type="number" min="1" />
              <select id="updateEvents_repeatDWMY" onClick={updateEvents_repeatF}>
                <option value="DAILY">일</option>
                <option value="WEEKLY">주</option>
                <option value="MONTHLY">월</option>
                <option value="YEARLY">년</option>
              </select>
            </p>
            <p id="insertEvents_repeatW">반복 요일</p>
            <p>
              <input id="MO2" type="checkbox" value="MO"/><span id="updateEvents_repeatW1">월</span>
              <input id="TU2" type="checkbox" value="TU"/><span id="updateEvents_repeatW2">화</span>
              <input id="WE2" type="checkbox" value="WE"/><span id="updateEvents_repeatW3">수</span>
              <input id="TH2" type="checkbox" value="TH"/><span id="updateEvents_repeatW4">목</span>
              <input id="FR2" type="checkbox" value="FR"/><span id="updateEvents_repeatW5">금</span>
              <input id="SA2" type="checkbox" value="SA"/><span id="updateEvents_repeatW6">토</span>
              <input id="SU2" type="checkbox" value="SU"/><span id="updateEvents_repeatW7">일</span>
            </p>
            <p>
              <select id="updateEvents_repeatM">
                <option id="updateEvents_repeatM1" value="same_day">같은 날짜</option>
                <option id="updateEvents_repeatM2" value="same_week">같은 주</option>
              </select>
            </p>
            <p>종료</p>
            <p><input id="updateEvents_repeatLast1" type="radio" name="updateEvents_repeatLast" value="없음"/>없음</p>
            <p><input id="updateEvents_repeatLast2" type="radio" name="updateEvents_repeatLast" value="날짜" />날짜<input id="updateEvents_repeatLastDate" type="date"/></p>
            <p><input id="updateEvents_repeatLast3" type="radio" name="updateEvents_repeatLast" value="다음" />다음<input id="updateEvents_repeatLastCount" type="number" min="1"/></p>
          </div>
          {/* updateEvents */}
          <div id='updateEvents' style={insertStyle}>
            <button onClick={offDisplayU}>x</button>
            <button onClick={updateEvents_repeatF}>o</button>
            <button onClick={deleteEvents_repeat2F}>delete</button>
            <p><input id="updateEvents_title" name="text" onChange={title} /></p>
            <p><input type="date" id="updateEvents_startDate" name="text" onChange={startDate} /><input type="time" id="updateEvents_startTime" name="text" onChange={startTime} /></p>
            <p><input type="date" id="updateEvents_endDate" name="text" onChange={endDate} /><input type="time" id="updateEvents_endTime" name="text" onChange={endTime} /></p>
            <p><input id="updateEvents_timeCheck" type="checkbox" onChange={updateEvents_timeCheck} /></p>
            <p>
              <input id="updateEvents_repeatCheck" type="checkbox" onChange={updateEvents_repeatCheck} />
              <select id="updateEvents_repeatDate">
                <option value="매일">매일</option>
                <option value="매주">매주</option>
                <option value="매월">매월</option>
                <option value="매년">매년</option>
                <option value="주중_매일(월-금)">주중 매일(월-금)</option>
                <option value="맞춤">맞춤</option>
              </select>
            </p>
            <p id="updateEvents_recurrence"></p>
            <p><input id="updateEvents_location" type="text" placeholder='위치 추가'/></p>
            <p><input id="updateEvents_description" type="text" placeholder='내용 추가'/></p>
          </div>

          {/* list */}
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
