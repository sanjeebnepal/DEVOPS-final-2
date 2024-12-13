pipeline {
    agent any

    stages {
        stage('Cleanup') {
            steps {
                cleanWs()
            }
        }

        stage('Clone Git Repo') {
            steps {
                git url: 'https://github.com/sanjeebnepal/DEVOPS_final-project.git', branch: 'test', credentialsId: 'GIT'
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    // Install system and project dependencies
                    sh '''
                        sudo apt update -y
                        sudo apt install -y nodejs npm chromium xvfb libgtk-3-0 libxss1 libasound2 libgdk-pixbuf2.0-0 libnss3
                        chromium --version
                        npm install
                        npm install --save-dev cypress
                        npx cypress install
                    '''
                }
            }
        }

        stage('Start Development Server') {
            steps {
                script {
                    // Start the Next.js development server in the background
                    sh 'nohup npm run dev > dev.log 2>&1 &'
                }
            }
        }

        stage('Run Cypress Tests') {
            steps {
                script {
                    // Run Cypress tests
                    sh 'npx cypress run --headless --browser chromium'
                }
            }
        }

        stage('Stop Development Server') {
            steps {
                script {
                    // Stop the Next.js development server
                    sh '''
                        SERVER_PID=$(lsof -t -i:3000)
                        if [ -n "$SERVER_PID" ]; then
                            kill -9 $SERVER_PID
                        fi
                    '''
                }
            }
        }

        stage('Trigger develop Pipeline') {
            steps {
                script {
                    // Trigger the 'develop' pipeline after 'test' finishes
                    build job: 'npestate-multibranch', parameters: [
                        string(name: 'BRANCH_NAME', value: 'develop')
                    ]
                }
            }
        }
    }
}

