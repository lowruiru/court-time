document.addEventListener('DOMContentLoaded', () => {
    fetch('instructors.json')
        .then(response => response.json())
        .then(data => {
            const instructors = data.instructors;
            const instructorsContainer = document.getElementById('instructors');
            const searchName = document.getElementById('search-name');
            const dayDate = document.getElementById('day-date');
            const time = document.getElementById('time');
            const level = document.getElementById('level');
            const budget = document.getElementById('budget');
            const budgetValue = document.getElementById('budget-value');
            const location = document.getElementById('location');
            const court = document.getElementById('court');
            const sort = document.getElementById('sort');

            budget.addEventListener('input', () => {
                budgetValue.textContent = budget.value >= 200 ? '$200+' : `$${budget.value}`;
                filterAndSortInstructors();
            });

            searchName.addEventListener('input', filterAndSortInstructors);
            dayDate.addEventListener('change', filterAndSortInstructors);
            time.addEventListener('change', filterAndSortInstructors);
            level.addEventListener('change', filterAndSortInstructors);
            location.addEventListener('change', filterAndSortInstructors);
            court.addEventListener('change', filterAndSortInstructors);
            sort.addEventListener('change', filterAndSortInstructors);

            // Region to locations mapping
            const regionToLocations = {
                "North": ["Ang Mo Kio", "Woodlands", "Sembawang", "Yishun"],
                "North-east": ["Hougang", "Punggol", "Sengkang", "Serangoon"],
                "East": ["Bedok", "Geylang", "Marine Parade", "Pasir Ris", "Tampines"],
                "Central": ["Central Area", "Bishan", "Toa Payoh", "Kallang/Whampoa"],
                "South": ["Bukit Merah", "Queenstown", "Bukit Timah"],
                "West": ["Bukit Batok", "Bukit Panjang", "Bukit Timah", "Choa Chu Kang", "Clementi", "Jurong East", "Jurong West", "Tengah"]
            };

            // Parse 12-hour time to minutes since midnight
            function parse12HourTime(timeStr) {
                try {
                    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
                    if (!match) throw new Error(`Invalid time format: ${timeStr}`);
                    let [_, hours, minutes, period] = match;
                    hours = parseInt(hours);
                    minutes = parseInt(minutes);
                    if (hours < 1 || hours > 12 || minutes >= 60) throw new Error(`Invalid time values: ${timeStr}`);
                    let hours24 = hours;
                    if (period.toUpperCase() === 'PM' && hours !== 12) hours24 += 12;
                    if (period.toUpperCase() === 'AM' && hours === 12) hours24 = 0;
                    const totalMinutes = hours24 * 60 + minutes;
                    console.log(`Parsed ${timeStr} to ${totalMinutes} minutes`);
                    return totalMinutes;
                } catch (error) {
                    console.error(error.message);
                    return -1; // Invalid time
                }
            }

            // Check if startTime falls within the selected time-of-day range
            function isTimeInRange(startTime, timeFilter) {
                if (!timeFilter) return true; // No time filter selected
                const timeInMinutes = parse12HourTime(startTime);
                if (timeInMinutes === -1) return false; // Invalid time
                const ranges = {
                    morning: [0, 12 * 60 - 1], // 00:00–11:59
                    afternoon: [12 * 60, 17 * 60 - 1], // 12:00–16:59
                    evening: [17 * 60, 24 * 60 - 1] // 17:00–23:59
                };
                const [start, end] = ranges[timeFilter] || [0, 24 * 60 - 1];
                const inRange = timeInMinutes >= start && timeInMinutes <= end;
                console.log(`Checking ${startTime} (${timeInMinutes} min) for ${timeFilter} (${start}–${end} min): ${inRange}`);
                return inRange;
            }

            function filterAndSortInstructors() {
                // Get selected region and map to locations
                const selectedRegion = location.value;
                const selectedLocations = selectedRegion ? regionToLocations[selectedRegion] : [];

                // Filter instructors
                let filteredInstructors = instructors.map(instructor => {
                    const nameMatch = instructor.name.toLowerCase().includes(searchName.value.toLowerCase());
                    const levelMatch = !level.value || instructor.levels.includes(level.value);
                    const budgetMatch = instructor.fee <= (budget.value >= 200 ? Infinity : budget.value);
                    const courtMatch = !court.value || instructor.schedule.some(s => s.court === court.value);

                    // Handle single region
                    let locationMatch = !selectedLocations.length; // True if no region selected
                    if (selectedLocations.length) {
                        locationMatch = instructor.schedule.some(s => 
                            s.locations.some(loc => selectedLocations.includes(loc))
                        );
                    }

                    // Require both date and time to match for the same schedule entry
                    let dateTimeMatch = true;
                    let matchingSchedule = null;
                    if (dayDate.value) {
                        if (time.value) {
                            // Both date and time are selected
                            matchingSchedule = instructor.schedule.find(s => 
                                s.date === dayDate.value && isTimeInRange(s.startTime, time.value)
                            );
                            dateTimeMatch = !!matchingSchedule;
                        } else {
                            // Only date is selected
                            matchingSchedule = instructor.schedule.find(s => s.date === dayDate.value);
                            dateTimeMatch = !!matchingSchedule;
                        }
                    } else if (time.value) {
                        // Only time is selected
                        matchingSchedule = instructor.schedule.find(s => isTimeInRange(s.startTime, time.value));
                        dateTimeMatch = !!matchingSchedule;
                    }

                    console.log(`Instructor ${instructor.name}: name=${nameMatch}, dateTime=${dateTimeMatch}, level=${levelMatch}, budget=${budgetMatch}, location=${locationMatch}, court=${courtMatch}`);
                    return { instructor, matches: nameMatch && dateTimeMatch && levelMatch && budgetMatch && locationMatch && courtMatch, matchingSchedule };
                }).filter(item => item.matches);

                console.log(`Filtered ${filteredInstructors.length} instructors`);

                // Sort instructors
                const [sortKey, sortDirection] = sort.value.split('-');
                filteredInstructors = filteredInstructors.sort((a, b) => {
                    if (sortKey === 'time') {
                        const timeA = a.matchingSchedule ? parse12HourTime(a.matchingSchedule.startTime) : Infinity;
                        const timeB = b.matchingSchedule ? parse12HourTime(b.matchingSchedule.startTime) : Infinity;
                        if (timeA === Infinity && timeB === Infinity) return 0;
                        if (timeA === Infinity) return 1;
                        if (timeB === Infinity) return -1;
                        return sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
                    } else {
                        const valueA = Number(a.instructor[sortKey]);
                        const valueB = Number(b.instructor[sortKey]);
                        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
                        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
                        return 0;
                    }
                });

                displayInstructors(filteredInstructors);
            }

            function displayInstructors(filteredItems) {
                instructorsContainer.innerHTML = '';
                if (filteredItems.length === 0) {
                    instructorsContainer.innerHTML = '<p>No instructors found matching your criteria.</p>';
                    return;
                }
                filteredItems.forEach(item => {
                    const { instructor, matchingSchedule } = item;
                    // Generate random review count
                    const rawCount = Math.floor(Math.random() * 1500); // 0–1499
                    const reviewCount = rawCount > 1000 ? '1,000+' : rawCount > 100 ? '100+' : rawCount.toString();

                    let lessonInfo = matchingSchedule ? `${matchingSchedule.startTime} (${matchingSchedule.duration} min)` : 'No schedule available';

                    // Get all unique locations for the instructor
                    const allLocations = [...new Set(instructor.schedule.flatMap(s => s.locations))].join(', ');

                    const listItem = document.createElement('div');
                    listItem.className = 'instructor-list-item';
                    listItem.innerHTML = `
                        <div class="list-column time-column">${lessonInfo}</div>
                        <div class="list-column name-column">
                            <h3>${instructor.name}</h3>
                            <p class="stars">${'★'.repeat(Math.round(instructor.rating))}${'☆'.repeat(5 - Math.round(instructor.rating))} (${reviewCount})</p>
                        </div>
                        <div class="list-column level-fee-column">
                            <p>Levels: ${instructor.levels.join(', ')}</p>
                            <p>Fee: $${instructor.fee}</p>
                            <p>Locations: ${allLocations}</p>
                        </div>
                        <div class="list-column button-column">
                            <div class="button-group">
                                <a href="https://wa.me/+6599999999?text=Hi%21%20I%20would%20like%20to%20book%20a%20class" class="button contact-btn">Contact</a>
                                <a href="profile.html?id=${instructor.id}" class="button view-more-btn">More</a>
                            </div>
                        </div>
                    `;
                    instructorsContainer.appendChild(listItem);
                });
            }

            filterAndSortInstructors();
        })
        .catch(error => {
            console.error('Error loading instructors.json:', error);
            instructorsContainer.innerHTML = '<p>Error loading instructors. Please try again later.</p>';
        });
});