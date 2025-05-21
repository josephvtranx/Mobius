import React from "react";
import { Square, Calendar, Download, Plus } from "../icons";


function Mcal() {
  return (
    <div className="sidebar">
      <div className="frame">
        <div className="section">
          <div className="sidebar-tab">
            <div className="text-wrapper">Events</div>
          </div>
          <div className="lecture">
            <Square color="#007878" />
            <div className="div-wrapper">
              <div className="div">SAT Math: Min</div>
            </div>
          </div>
          <div className="lecture-2">
            <Square color="#4693F0" />
            <div className="div-wrapper">
              <div className="text-wrapper-2">SAT Math: YJ</div>
            </div>
          </div>
          <div className="lecture-3">
            <Square color="#D57309" />
            <div className="div-wrapper">
              <div className="text-wrapper-3">Consultation</div>
            </div>
          </div>
          <div className="lecture-4">
            <Square color="#323232" />
            <div className="div-wrapper">
              <div className="text-wrapper-4">Meetings</div>
            </div>
          </div>
          <div className="lecture-5">
            <Square color="#961013" />
            <div className="div-wrapper">
              <div className="text-wrapper-5">Exams</div>
            </div>
          </div>
        </div>
      </div>
      <div className="frame-2">
        <div className="reschedule">
          <div className="text-wrapper-6">Pending Blocks</div>
        </div>
        <div className="frame-wrapper">
          <div className="frame-3">
            <div className="station">
              <div className="peding-block">
                <div className="text-wrapper-7">No Pending Events</div>
              </div>
              <div className="reschedule-2">
                <Calendar className="icon-instance-node" />
                <div className="text-wrapper-8">Reschedule</div>
              </div>
            </div>
            <div className="frame-4">
              <div className="buttons-wrapper">
                <div className="buttons">
                  <div className="frame-5">
                    <div className="frame-6">
                      <Plus className="icon-instance-node" />
                      <div className="text-wrapper-9">Add Event</div>
                    </div>
                    <div className="frame-6">
                      <Download className="icon-instance-node" />
                      <div className="text-wrapper-9">Import/Export</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Mcal;