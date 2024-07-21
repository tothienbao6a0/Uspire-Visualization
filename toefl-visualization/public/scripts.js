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
        .then(data => {
            // Create charts for each student
            data.forEach(student => {
                const studentId = student._id;
                const studentName = student.firstName + ' ' + student.lastName;

                // Fetch progress data for each student
                fetch(`/api/student/${studentId}`)
                    .then(response => response.json())
                    .then(progressData => {
                        const tasks = progressData.progress; // Assuming data.progress is an array of task objects

                        if (!tasks || tasks.length === 0) {
                            console.warn(`No progress data available for student ${studentName}`);
                            return;
                        }

                        const taskLabels = tasks.map(task => `Task ${task.taskId}`); // Create labels for each task
                        const taskScores = tasks.map(task => task.score); // Scores for each task

                        // Create a new canvas element for each student
                        const canvas = document.createElement('canvas');
                        canvas.id = `progressChart-${studentId}`;
                        document.getElementById('chartsContainer').appendChild(canvas);

                        const ctx = canvas.getContext('2d');
                        new Chart(ctx, {
                            type: 'bar',
                            data: {
                                labels: taskLabels,
                                datasets: [{
                                    label: `${studentName}'s Progress`,
                                    data: taskScores,
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
                    .catch(error => console.error(`Error fetching progress for student ${studentId}:`, error));
            });
        })
        .catch(error => console.error('Error fetching students data:', error));
});
