/**
 * Safe website-only answers used while the hosted AI API is unavailable.
 * This keeps public help functional without exposing keys or account data.
 */
export function websiteAssistantFallback(message: string): string {
  const query = message.toLowerCase();

  if (/fee|pay|payment|receipt/.test(query)) {
    return 'To pay a fee:\n1. Sign in and open **My Fee Details**.\n2. Select the listed fee.\n3. Choose the approved payment option and confirm it.\n4. Open **My Receipts** to view or download the receipt.';
  }
  if (/timetable|schedule|today.?s class|today.?s lesson/.test(query)) {
    return 'To see today’s timetable:\n1. Sign in to ClassLine.\n2. Open **Timetable & Events**.\n3. Select today’s date to view the applicable class timetable.';
  }
  if (/what can teachers|teacher workspace|teacher dashboard|staff/.test(query)) {
    return 'Teachers can use **Daily Dispatch & Log** to send notices and family messages, review parent replies and sign-offs, manage gradebook work, and use **ClassLine Assist** to prepare drafts for review.';
  }
  if (/message|contact|teacher/.test(query)) {
    return 'To message a teacher:\n1. Sign in to ClassLine.\n2. Open **Teacher Messages**.\n3. Select the relevant conversation.\n4. Write your message and select **Send**.';
  }
  if (/report|result|grade|mark/.test(query)) {
    return 'To view a report card:\n1. Sign in to ClassLine.\n2. Open **Report Card & Results**.\n3. Select the relevant child and assessment to view the available results.';
  }
  if (/password|sign.?in|login|log in|reset/.test(query)) {
    return 'Use the **Parent Login** or **Teacher Login** option on the ClassLine homepage. Select **Forgot password?** if you need help resetting your school login.';
  }
  if (/parent|family/.test(query)) {
    return 'Parents can view timetables, teacher messages, attendance, report cards, fees, receipts, events, and notifications after signing in to ClassLine.';
  }

  return 'I can help with ClassLine features such as timetables, teacher messages, fees, payments, receipts, report cards, notifications, and sign-in help. Please ask about one of these areas.';
}
