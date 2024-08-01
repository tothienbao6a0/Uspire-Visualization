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
        students.forEach(student => {
            const studentId = student._id;
            const studentName = student.firstName + ' ' + student.lastName;

            fetch(`/api/student/${studentId}`)
                .then(response => response.json())
                .then(progressData => {
                    if (!progressData || Object.keys(progressData).length === 0) {
                        console.warn(`No progress data available for student ${studentName}`);
                        return;
                    }

                    // Create a container div for each student
                    const studentContainer = document.createElement('div');
                    studentContainer.classList.add('studentContainer');
                    document.getElementById('chartsContainer').appendChild(studentContainer);

                    // Create a 2x2 grid for the student's charts
                    ['SPEAKING', 'WRITING', 'LISTENING', 'READING'].forEach(type => {
                        const progress = progressData[type];
                        if (!progress) return;

                        const attempts = progress.map(p => p.attemptNumber);
                        const totalScores = progress.map(p => p.totalScore);
                        const totalPoints = progress.map(p => p.totalPoints);

                        // Create a canvas element for each question_type chart
                        const canvas = document.createElement('canvas');
                        canvas.id = `progressChart-${studentId}-${type}`;
                        studentContainer.appendChild(canvas);

                        const ctx = canvas.getContext('2d');
                        new Chart(ctx, {
                            type: 'line',
                            data: {
                                labels: attempts,
                                datasets: [
                                    {
                                        label: `${studentName} - ${type} Total Score`,
                                        data: totalScores,
                                        borderColor: 'rgba(75, 192, 192, 1)',
                                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                        fill: false
                                    },
                                    {
                                        label: `${studentName} - ${type} Total Points`,
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
