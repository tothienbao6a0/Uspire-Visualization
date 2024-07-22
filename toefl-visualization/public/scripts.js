document.addEventListener('DOMContentLoaded', function () {
    // Fetch data for the number of students per test center
    fetch('/api/centers')
        .then(response => response.json())
        .then(data => {
            // Assuming data is an array of objects with organizationName and count
            const labels = data.map(item => item.organizationName || item._id); // Replace with actual field if organizationName is available
            const values = data.map(item => item.count); // Number of students

            const ctx1 = document.getElementById('studentsChart').getContext('2d');
            new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Number of Students per Test Center',
                        data: values,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        x: {
                            beginAtZero: true
                        },
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        })
        .catch(error => console.error('Error fetching data for centers:', error));

    // Fetch data for all students
    fetch('/api/students')
        .then(response => response.json())
        .then(students => {
            // Create charts for each student
            students.forEach(student => {
                const studentId = student._id;
                const studentName = student.firstName + ' ' + student.lastName;

                // Fetch progress data for each student
                fetch(`/api/student/${studentId}`)
                    .then(response => response.json())
                    .then(progressData => {
                        if (!progressData || progressData.length === 0) {
                            console.warn(`No progress data available for student ${studentName}`);
                            return;
                        }

                        const attempts = progressData.map(p => p.attemptNumber);
                        const totalScores = progressData.map(p => p.totalScore);
                        const totalPoints = progressData.map(p => p.totalPoints);

                        // Create a new canvas element for each student
                        const canvas = document.createElement('canvas');
                        canvas.id = `progressChart-${studentId}`;
                        document.getElementById('chartsContainer').appendChild(canvas);

                        const ctx = canvas.getContext('2d');
                        new Chart(ctx, {
                            type: 'line', // Using line chart to show progress over attempts
                            data: {
                                labels: attempts,
                                datasets: [
                                    {
                                        label: `${studentName}'s Total Score`,
                                        data: totalScores,
                                        borderColor: 'rgba(75, 192, 192, 1)',
                                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                        fill: false
                                    },
                                    {
                                        label: `${studentName}'s Total Points`,
                                        data: totalPoints,
                                        borderColor: 'rgba(153, 102, 255, 1)',
                                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
                                        fill: false
                                    }
                                ]
                            },
                            options: {
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: 'Attempt Number'
                                        }
                                    },
                                    y: {
                                        title: {
                                            display: true,
                                            text: 'Score / Points'
                                        },
                                        beginAtZero: true
                                    }
                                }
                            }
                        });
                    })
                    .catch(error => console.error(`Error fetching progress for student ${studentId}:`, error));
            });
        })
        .catch(error => console.error('Error fetching students data:', error));

    // Fetch data for the number of days since creation for each organization
    fetch('/api/organizations')
        .then(response => response.json())
        .then(data => {
            const labels = data.map(item => item.organizationName);
            const values = data.map(item => item.daysSinceCreation);

            const ctx2 = document.getElementById('organizationsChart').getContext('2d');
            new Chart(ctx2, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Days Since Creation for Each Organization',
                        data: values,
                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        x: {
                            beginAtZero: true
                        },
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        })
        .catch(error => console.error('Error fetching data for organizations:', error));
});
