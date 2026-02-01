// Review Management JavaScript

let currentReviewId = null;

// Open Reply Modal
function openReplyModal(button) {
  currentReviewId = button.getAttribute("data-review-id"); // ✅ ADDED
  const customerName = button.getAttribute("data-customer-name"); // ✅ ADDED

  document.getElementById("customerName").textContent = customerName;
  document.getElementById("replyMessage").value = "";
  document.getElementById("replyModal").style.display = "block";
}

// Close Reply Modal
function closeReplyModal() {
  document.getElementById('replyModal').style.display = 'none';
  currentReviewId = null;
}

// Submit Reply
async function submitReply() {
  const message = document.getElementById('replyMessage').value.trim();
  
  if (!message) {
    alert('Please enter a reply message');
    return;
  }

  if (!currentReviewId) {
    alert('No review selected');
    return;
  }

  try {
    const response = await fetch('/admin/reply/review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reviewId: currentReviewId,
        action: 'REPLY',
        message: message
      })
    });

    const result = await response.json();

    if (result.state === 'success') {
      alert('Reply sent successfully! The customer will be notified.');
      closeReplyModal();
      location.reload(); // Refresh to show updated data
    } else {
      alert('Failed to send reply: ' + (result.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error sending reply:', error);
    alert('Failed to send reply. Please try again.');
  }
}

// Hide Review
async function hideReview(reviewId) {
  if (!confirm('Are you sure you want to hide this review?')) {
    return;
  }

  try {
    const response = await fetch('/admin/reply/review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reviewId: reviewId,
        action: 'HIDE'
      })
    });

    const result = await response.json();

    if (result.state === 'success') {
      alert('Review hidden successfully');
      location.reload();
    } else {
      alert('Failed to hide review: ' + (result.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error hiding review:', error);
    alert('Failed to hide review. Please try again.');
  }
}

// Show Review (unhide)
async function showReview(reviewId) {
  if (!confirm('Are you sure you want to publish this review again?')) {
    return;
  }

  try {
    const response = await fetch('/admin/reply/review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reviewId: reviewId,
        action: 'SHOW'
      })
    });

    const result = await response.json();

    if (result.state === 'success') {
      alert('Review published successfully');
      location.reload();
    } else {
      alert('Failed to publish review: ' + (result.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error publishing review:', error);
    alert('Failed to publish review. Please try again.');
  }
}

// Request Update
async function requestUpdate(reviewId) {
  if (!confirm('Request the customer to update this review? They will be able to edit it for 7 more days.')) {
    return;
  }

  try {
    const response = await fetch('/admin/reply/review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reviewId: reviewId,
        action: 'REQUEST_UPDATE'
      })
    });

    const result = await response.json();

    if (result.state === 'success') {
      alert('Update request sent successfully');
      location.reload();
    } else {
      alert('Failed to send update request: ' + (result.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error requesting update:', error);
    alert('Failed to send update request. Please try again.');
  }
}

// Filter reviews by rating
document.getElementById('filterRating')?.addEventListener('change', function(e) {
  const rating = e.target.value;
  const rows = document.querySelectorAll('.review-row');
  
  rows.forEach(row => {
    if (!rating) {
      row.style.display = '';
    } else {
      const rowRating = row.querySelector('.rating-stars').dataset.rating;
      row.style.display = rowRating === rating ? '' : 'none';
    }
  });
});

// Filter reviews by status
document.getElementById('filterStatus')?.addEventListener('change', function(e) {
  const status = e.target.value.toUpperCase();
  const rows = document.querySelectorAll('.review-row');
  
  rows.forEach(row => {
    if (!status) {
      row.style.display = '';
    } else {
      const badge = row.querySelector('.status-badge');
      const rowStatus = badge.textContent.trim().toUpperCase();
      row.style.display = rowStatus === status ? '' : 'none';
    }
  });
});

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('replyModal');
  if (event.target === modal) {
    closeReplyModal();
  }
};

// Highlight low-rating reviews on page load
document.addEventListener('DOMContentLoaded', function() {
  const lowRatingRows = document.querySelectorAll('.review-row.low-rating');
  console.log(`Found ${lowRatingRows.length} low-rating reviews`);
});
