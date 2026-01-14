# Support Ticket System Integration - Implementation Summary

## ✅ Completed Implementation

### Backend Integration

- **API Endpoint**: `/api/v1/minta-fresh/support/user/tickets/*`
- **Base URL**: Configured in `src/api/api.ts`

### Files Created/Modified 

#### API Hooks (`src/api/hooks/useSupportTickets.ts`)

- ✅ `useCreateTicket()` - Create new support ticket with image upload
- ✅ `useGetAllTickets()` - Fetch all user tickets
- ✅ `useGetTicketById()` - Fetch single ticket by ID
- ✅ `useGetTicketStats()` - Get ticket statistics
- ✅ `useAddMessage()` - Add message to ticket with optional image
- ✅ `useReopenTicket()` - Reopen closed ticket
- ✅ `useSubmitFeedback()` - Submit feedback for ticket
- ✅ `useCloseTicket()` - Close a ticket

#### Screens

1. **ReportIssue.tsx** - Create new support ticket

   - Category selection (ORDER_ISSUE, DELIVERY_ISSUE, etc.)
   - Subject and description input
   - Optional order ID
   - Single image upload (max 200KB)
   - Form validation
   - Loading states

2. **MyTickets.tsx** - View all tickets

   - List of all user tickets
   - Status badges with colors
   - Pull-to-refresh
   - Navigate to ticket details
   - Empty state with create button

3. **TicketDetails.tsx** - View ticket details (NEEDS FIXES)
   - Full ticket information
   - Send messages with optional image
   - Close ticket functionality
   - View attachments

#### Navigation

- Added to `src/types/type.ts`:
  - `MyTickets: undefined`
  - `TicketDetails: { ticketId: string }`
- Added to HelpAndSupport quick actions

### Features Implemented

#### Ticket Creation

- 5 categories: Order Issue, Delivery Problem, Payment Error, App Bug, Product Quality
- Required fields: subject, description
- Optional fields: orderId, image attachment
- Auto-priority: MEDIUM
- Auto-source: MOBILE_APP

#### Image Upload

- Max 1 image per ticket/message
- Max size: 200KB
- Supported formats: JPEG, PNG, WEBP
- Form data upload to Cloudinary
- File size validation

#### Ticket Status

- Visual status badges with colors:
  - OPEN (Blue)
  - IN_PROGRESS (Orange)
  - AWAITING_RESPONSE (Purple)
  - RESOLVED (Green)
  - CLOSED (Gray)

### API Response Format

```json
{
  "success": true,
  "message": "Support ticket created successfully",
  "data": {
    "id": "1",
    "ticketNumber": "TKT-2026-000001",
    "category": "ORDER_ISSUE",
    "subject": "...",
    "description": "...",
    "priority": "MEDIUM",
    "status": "OPEN",
    "attachments": {
      "public_id": "...",
      "url": "..."
    },
    "createdAt": "2026-01-13T...",
    "updatedAt": "2026-01-13T..."
  }
}
```

### Known Issues to Fix

1. MyTickets.tsx - `isRefreshing` property doesn't exist (use `isFetching` instead)
2. TicketDetails.tsx - Alert and quality property issues (same as ReportIssue)
3. HelpAndSupport.tsx - Navigation type issue with dynamic routes

### Usage Example

```typescript
// Create ticket
const { mutate: createTicket } = useCreateTicket();
createTicket({
  category: 'ORDER_ISSUE',
  subject: 'Order not delivered',
  description: 'My order #12345 was not delivered',
  orderId: '12345',
  image: {
    uri: 'file://...',
    type: 'image/jpeg',
    name: 'photo.jpg'
  }
});

// Get all tickets
const { data: tickets } = useGetAllTickets();

// Add message to ticket
const { mutate: addMessage } = useAddMessage();
addMessage({
  ticketId: '1',
  messageData: {
    message: 'Here is a screenshot',
    image: { ... }
  }
});
```

### Testing Checklist

- [ ] Create ticket without image
- [ ] Create ticket with image (< 200KB)
- [ ] Create ticket with image (> 200KB) - should show error
- [ ] View all tickets list
- [ ] View individual ticket details
- [ ] Send message without image
- [ ] Send message with image
- [ ] Close ticket
- [ ] Navigate between screens
- [ ] Pull to refresh on MyTickets
- [ ] Error handling for network failures
