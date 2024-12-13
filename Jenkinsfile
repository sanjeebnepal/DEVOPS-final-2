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

        stage('Build and run docker image') {
            steps {
                sh 'sudo docker build -t sanjeebnepal/npestate:latest .' 
                sh 'sudo docker stop npestate-con || true && sudo docker rm npestate-con || true'
                sh 'sudo docker run --name npestate-con -d -p 8081:3000  sanjeebnepal/npestate:latest'
            } 
        }

        stage('testing') {
            steps {
                sh 'sleep 10'
                sh 'curl -I --max-time 60 192.168.10.152:8081'
            }
        }

        stage('Build and Push') {
            steps {
                echo 'Building..'
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-auth', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                        sh '''
                            sudo docker login -u ${USERNAME} -p ${PASSWORD}
                            sudo docker push sanjeebnepal/npestate:latest
                        '''
                        sh "sudo docker tag sanjeebnepal/npestate:latest sanjeebnepal/npestate:develop-${env.BUILD_ID}"
                        sh "sudo docker push sanjeebnepal/npestate:develop-${env.BUILD_ID}"
                    }
            }
        }

        stage('Trigger staging Pipeline') {
            steps {
                script {
                    // Trigger the 'staging' pipeline after 'test' finishes
                    build job: 'npestate-staging', wait: false
                }
            }
        }
    }
}

