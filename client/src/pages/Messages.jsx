// Messages (design handoff README > Student app / Instructor app >
// Messages): 320px thread list + conversation pane + compose modal. There
// is no messaging backend anywhere in the server (no routes, no tables) —
// this is a real, unbuilt feature, not something to fake a thread list
// for. Ships as an honest placeholder.
import '@/css/attendance.css';

function Messages() {
  return (
    <div className="at-page">
      <h1 className="at-title">Messages</h1>
      <div className="hm-card">
        <p>Messaging isn't available yet — there's no messaging backend built.</p>
        <p className="at-subtitle">Check back once the messaging feature ships.</p>
      </div>
    </div>
  );
}

export default Messages;
