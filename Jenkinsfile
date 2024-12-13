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
                checkout scm
            }
        }
        stage('Clone from repository') {
            steps {
                git url: 'https://github.com/sanjeebnepal/DEVOPS_final-project.git', branch: 'develop', credentialsId: 'GIT'
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
                sh 'curl -I --max-time 60 192.168.10.128:8081'
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
        
        stage('Trigger Main Pipeline') {
            steps {
                script {
                    // Trigger the 'main' pipeline after 'develop' finishes
                    build job: 'npestate-multibranch', parameters: [
                        string(name: 'BRANCH_NAME', value: 'main')
                    ]
                }
            }
        }
    
    }
}
