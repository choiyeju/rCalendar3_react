import React, { Component, useEffect, useState } from 'react'
import { getMonth } from './src_react/util';
import CalendarHeader from './src_react/components/CalendarHeader';
import Sidebar from './src_react/components/Sidebar';
import Month from './src_react/components/Month';
import axios from 'axios';
// import { parse } from '@babel/core';
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import gapi from 'react-gapi';
// import logo from './logo.svg';
//import ApiCalendar from 'react-google-calendar-api';
//import { Button, View } from 'react-native';

var _title = ''
var _start = ''
var _end = ''
var _eventId = ''
var _tstart = ''
var _tend = ''

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
      onDisplay()
      change('', '')
      change2('', event.dateStr)
      change3('', event.dateStr)
      change5('', '')
      change6('', '')

      $('#change').val('')
      $('#change2').val(event.dateStr)
      $('#change3').val(event.dateStr)
      $('#change4').val(_tstart)
      $('#change5').val(_tend)
      
      document.getElementById('time_check_insert').checked = true
    },
    eventClick:function(event) {
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
      }
      // $("#change7").datepicker();
      // $("#change8").datepicker();
      const element = document.getElementById('eventsCenter')
      if (mainEnd === "")
        element.innerHTML = Display(event.event._def.title, mainStart, mainStart, '', '')
      else if (mainEnd.length < 11)
        element.innerHTML = Display(event.event._def.title, mainStart, yesterday, '', '')
      else
        element.innerHTML = Display(event.event._def.title, cstart, cend, tstart, tend)
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
            id : id
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

    var event = null;
    if (tstart != '' && document.getElementById('time_check_update').checked === true) {
      start = start + 'T' + tstart + ':00+09:00'
      end = end + 'T' + tend + ':00+09:00'
      event = {
        'summary': title,
        'location': '',
        'description': '',
        'start': {
          'dateTime': start,
          'timeZone': 'Asia/Dili'
        },
        'end': {
          'dateTime': end,
          'timeZone': 'Asia/Dili'
        },
        // 'recurrence': [
        //   'RRULE:FREQ=DAILY;COUNT=1'
        // ],
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
        'location': '',
        'description': '',
        'start': {
          'date': start,
        },
        'end': {
          'date': end,
        },
        // 'recurrence': [
        //   'RRULE:FREQ=DAILY;COUNT=1'
        // ],
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
  }
  function updateEventsF(title, start, end, eventId, tstart, tend) {
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

    var event = null;
    if (tstart != '' && document.getElementById('time_check_update').checked === true){
      start = start + 'T' + tstart + ':00+09:00'
      end = end + 'T' + tend + ':00+09:00'
      event = {
        'summary': title,
        'location': '',
        'description': '',
        'start': {
          'dateTime': start,
          'timeZone': 'Asia/Dili'
        },
        'end': {
          'dateTime': end,
          'timeZone': 'Asia/Dili'
        },
        // 'recurrence': [
        //   'RRULE:FREQ=DAILY;COUNT=1'
        // ],
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
        'location': '',
        'description': '',
        'start': {
          'date': start,
        },
        'end': {
          'date': end,
        },
        // 'recurrence': [
        //   'RRULE:FREQ=DAILY;COUNT=1'
        // ],
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
      'eventId': eventId,
      'resource': event
    });
    request.execute(function(event) {
    })
    loadCalendarApi()
    $('#updateEvents').hide()
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

  function insertDisplay() {
    if ( _tstart == '')
      InsertEventsF(_title, _start, makeTomorrow(_end), _tstart, _tend)
    else 
      InsertEventsF(_title, _start, _end, _tstart, _tend)
  }
  function updateDisplay() {
    if ( _tstart == '')
      updateEventsF(_title, _start, makeTomorrow(_end), _eventId, _tstart, _tend)
    else 
      updateEventsF(_title, _start, _end, _eventId, _tstart, _tend)
  }
  function deleteDisplay() {
    deleteEventsF(_eventId)
  }

  function Display(title, start, end, tstart, tend) {
    if (tstart == '')
      return '<p>' + title + '</p><p>' + start + '</p><p>' + end + '</p>'
    else
      return '<p>' + title + '</p><p>' + start + " " + tstart + '</p><p>' + end + " " + tend + '</p>'
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

  const insertStyle = {
    padding: 10,
    display: 'none',
    position: 'absolute',
    width: 400,
    height: 500,
    backgroundColor: 'ivory',
    zIndex: 999,
  }

  if (loggedIn) {
    return (
      <div className='App'>
        <header className='App-header'>
          <div id='insertEvents' style={insertStyle}>
            <button onClick={offDisplay}>x</button>
            <button onClick={insertDisplay}>o</button>
            <p><input id="change" name="text" placeholder='(제목 및 시간 추가)' onChange={change} /></p>
            <p><input type="date" id="change2" name="text" onChange={change2} /><input type="time" id="change4" name="text" onChange={change5} /></p>
            <p><input type="date" id="change3" name="text" onChange={change3} /><input type="time" id="change5" name="text" onChange={change6} /></p>
            <p><input id="time_check_insert" type="checkbox" onChange={time_check_insert} /></p>
          </div>

          <div id='mainEvents' style={insertStyle}>
            <button onClick={offDisplayM}>x</button>
            <button onClick={onDisplayU}>update</button>
            <div id='eventsCenter'></div>
          </div>

          <div id='updateEvents' style={insertStyle}>
            <button onClick={offDisplayU}>x</button>
            <button onClick={updateDisplay}>o</button>
            <button onClick={deleteDisplay}>delete</button>
            <p><input id="change6" name="text" onChange={change} /></p>
            <p><input type="date" id="change7" name="text" onChange={change2} /><input type="time" id="change9" name="text" onChange={change5} /></p>
            <p><input type="date" id="change8" name="text" onChange={change3} /><input type="time" id="change10" name="text" onChange={change6} /></p>
            <p><input id="time_check_update" type="checkbox" onChange={time_check} /></p>
          </div>

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
        <button id="authorize-button" onClick={() => handleAuthClick(event)}>Login</button>
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