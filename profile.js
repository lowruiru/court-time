document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const instructorId = parseInt(urlParams.get('id'));

    fetch('instructors.json')
        .then(response => response.json())
        .then(data => {
            const instructor = data.instructors.find(i => i.id === instructorId);
            if (!instructor) {
                console.error('Instructor not found');
                document.querySelector('.profile-container').innerHTML = '<p>Instructor not found.</p>';
                return;
            }

            // Populate instructor details
            document.getElementById('instructor-image').alt = instructor.name;
            document.getElementById('instructor-name').textContent = instructor.name;
            document.getElementById('instructor-gender').textContent = instructor.gender;
            document.getElementById('instructor-levels').textContent = instructor.levels.join(', ');
            document.getElementById('instructor-fee').textContent = `$${instructor.fee}`;
            // Generate random review count and update rating
            const rawCount = Math.floor(Math.random() * 1500); // 0–1499
            const reviewCount = rawCount > 1000 ? '1,000+' : rawCount > 100 ? '100+' : rawCount.toString();
            document.getElementById('instructor-rating').innerHTML = `${'★'.repeat(Math.round(instructor.rating))}${'☆'.repeat(5 - Math.round(instructor.rating))} (${reviewCount})`;

            // Generate refined instructor description
            const yearsExperience = Math.floor(Math.random() * 16) + 5; // 5–20 years
            const strengths = [
                'technical precision', 'motivational coaching', 'strategic gameplay', 
                'player confidence building', 'fitness integration', 'personalized drills'
            ].sort(() => Math.random() - 0.5).slice(0, 2); // Pick 2 random strengths
            const sellingPoints = [
                'tailored lesson plans for all skill levels', 
                'proven track record of student improvement', 
                'engaging and supportive teaching style', 
                'focus on both mental and physical game', 
                'flexible scheduling to fit your needs'
            ].sort(() => Math.random() - 0.5).slice(0, 2); // Pick 2 random selling points
            const description = `
                With ${yearsExperience} years of coaching experience, ${instructor.name} specializes in ${strengths.join(' and ')}. 
                Renowned for ${sellingPoints.join(' and ')}, they offer a dynamic and personalized approach to elevate your tennis skills. 
                Contact today to schedule a session!
            `;
            document.getElementById('instructor-description').innerHTML = `<p>${description}</p>`;

            // Populate schedule
            const scheduleBody = document.getElementById('schedule-body');
            instructor.schedule.forEach(s => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${s.date}</td>
                    <td>${s.startTime}</td>
                    <td>${s.duration} min</td>
                    <td>${s.locations.join(', ')}</td>
                    <td>${s.court === 'instructor' ? 'Instructor provides court' : 'Travel to my court'}</td>
                `;
                scheduleBody.appendChild(row);
            });

            // Populate testimonials
            const testimonialsDiv = document.getElementById('testimonials');
            instructor.testimonials.forEach(t => {
                const p = document.createElement('p');
                p.className = 'testimonial';
                p.textContent = t;
                testimonialsDiv.appendChild(p);
            });

            // Handle feedback form submission (placeholder)
            document.getElementById('feedback-form').addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Feedback submitted! (This is a placeholder.)');
            });
        })
        .catch(error => {
            console.error('Error loading instructors.json:', error);
            document.querySelector('.profile-container').innerHTML = '<p>Error loading instructor data.</p>';
        });
});