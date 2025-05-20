document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const instructorId = parseInt(urlParams.get('id'));

    // Sample data (replace with fetch from instructors.json in a real app)
    const instructors = [
        {
            id: 1,
            name: "John Doe",
            gender: "male",
            levels: ["beginner"],
            fee: 40,
            rating: 4.5,
            image: "https://via.placeholder.com/120",
            description: "John is a dedicated tennis coach with over 5 years of experience, specializing in helping beginners build a strong foundation.",
            schedule: [
                {date: "May 26, 2025", time: "10:00 AM", duration: "1 hour", location: "Jurong West", court: "Court A"},
                {date: "May 27, 2025", time: "11:00 AM", duration: "1 hour", location: "Jurong West", court: "Court B"}
            ],
            testimonials: [
                {rating: 5, feedback: "Great coach! Very patient and clear instructions.", reviewer: "Alex Tan"},
                {rating: 4, feedback: "Good session, but could use more drills.", reviewer: "Sarah Lim"}
            ]
        },
        {
            id: 2,
            name: "Jane Smith",
            gender: "female",
            levels: ["advanced"],
            fee: 60,
            rating: 4.8,
            image: "https://via.placeholder.com/120",
            description: "Jane is an advanced coach who has trained competitive players for national tournaments.",
            schedule: [
                {date: "May 26, 2025", time: "2:00 PM", duration: "1 hour", location: "Serangoon", court: "Court C"},
                {date: "May 28, 2025", time: "3:00 PM", duration: "1 hour", location: "Serangoon", court: "Court D"}
            ],
            testimonials: [
                {rating: 5, feedback: "Amazing coach! Improved my backhand significantly.", reviewer: "Michael Chen"},
                {rating: 4, feedback: "Very knowledgeable, but sessions can be intense.", reviewer: "Emily Wong"}
            ]
        },
        {
            id: 3,
            name: "Mike Johnson",
            gender: "male",
            levels: ["beginner", "advanced"],
            fee: 50,
            rating: 4.2,
            image: "https://via.placeholder.com/120",
            description: "Mike offers flexible coaching for both beginners and advanced players, focusing on technique and strategy.",
            schedule: [
                {date: "May 27, 2025", time: "1:00 PM", duration: "1 hour", location: "Tampines", court: "Court E"},
                {date: "May 29, 2025", time: "2:00 PM", duration: "1 hour", location: "Tampines", court: "Court F"}
            ],
            testimonials: [
                {rating: 4, feedback: "Helpful tips for my serve, good session!", reviewer: "Daniel Lee"},
                {rating: 5, feedback: "Really tailored the lesson to my needs.", reviewer: "Rachel Ng"}
            ]
        }
    ];

    const instructor = instructors.find(i => i.id === instructorId);

    if (instructor) {
        document.getElementById('instructor-name').textContent = instructor.name;
        document.getElementById('instructor-gender').textContent = instructor.gender.charAt(0).toUpperCase() + instructor.gender.slice(1);
        document.getElementById('instructor-levels').textContent = instructor.levels.join(', ');
        document.getElementById('instructor-fee').textContent = `$${instructor.fee}`;
        document.getElementById('instructor-rating').textContent = `★★★★★ ${instructor.rating}`;
        document.getElementById('instructor-image').src = instructor.image;
        document.getElementById('instructor-description').innerHTML = `<p>${instructor.description}</p>`;

        const scheduleBody = document.getElementById('schedule-body');
        instructor.schedule.forEach(slot => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${slot.date}</td>
                <td>${slot.time}</td>
                <td>${slot.duration}</td>
                <td>${slot.location}</td>
                <td>${slot.court}</td>
            `;
            scheduleBody.appendChild(row);
        });

        // Display testimonials (publicly visible)
        const testimonialsDiv = document.getElementById('testimonials');
        instructor.testimonials.forEach(testimonial => {
            const div = document.createElement('div');
            div.className = 'testimonial';
            div.innerHTML = `<strong>${testimonial.reviewer}</strong>: ${testimonial.feedback} (${'★'.repeat(testimonial.rating)})`;
            testimonialsDiv.appendChild(div);
        });
    }

    // Google Sign-In Callback
    window.handleCredentialResponse = (response) => {
        const credential = response.credential;
        // Decode the ID token (simplified; use a backend in production)
        const payload = JSON.parse(atob(credential.split('.')[1]));
        const userName = payload.name; // Get the user's name

        document.getElementById('login-status').textContent = `Signed in as ${userName}.`;
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('feedback-form').style.display = 'flex';

        // Store user name for feedback submission
        window.currentUser = { name: userName };
    };

    const feedbackForm = document.getElementById('feedback-form');
    feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!window.currentUser) {
            alert('Please sign in with Google to submit feedback.');
            return;
        }

        const rating = document.getElementById('feedback-rating').value;
        const feedback = document.getElementById('feedback-text').value;
        const newTestimonial = {
            rating: parseInt(rating),
            feedback: feedback,
            reviewer: window.currentUser.name
        };

        instructor.testimonials.push(newTestimonial);
        const div = document.createElement('div');
        div.className = 'testimonial';
        div.innerHTML = `<strong>${newTestimonial.reviewer}</strong>: ${newTestimonial.feedback} (${'★'.repeat(newTestimonial.rating)})`;
        document.getElementById('testimonials').appendChild(div);

        feedbackForm.reset();
    });
});