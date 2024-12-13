pipeline {
    agent any

    environment {
        KUBE_MASTER = "192.168.10.148"  //IP of master node
        DOCKER_IMAGE = "sanjeebnepal/npestate:latest"
        WORKER_NODES = "192.168.10.149 192.168.10.151" //worker node IPs
    }

    stages {
        stage('Setup SSH Agent') {
            steps {
                script {
                    // Ensure the SSH agent is initialized
                    sshagent(['ssh-key']) {
                        // Now the agent will be available for use in subsequent stages
                    }
                }
            }
        }

        stage('Check and Install K3s on Control Node') {
            steps {
                script {
                    sshagent(['ssh-key']) {
                        // Check if K3s is installed on the control node
                        def k3s_installed = sh(script: "ssh vagrant@${KUBE_MASTER} 'which k3s'", returnStatus: true)
                        if (k3s_installed != 0) {
                            // Install K3s if not installed
                            echo "K3s is not installed, installing..."
                            sh """
                            ssh vagrant@${KUBE_MASTER} 'curl -sfL https://get.k3s.io | sh -'
                            """
                        } else {
                            echo "K3s is already installed on control node."
                        }
                    }
                }
            }
        }

        stage('Check and Install K3s on Worker Nodes') {
            steps {
                script {
                    sshagent(['ssh-key']) {
                        // Retrieve K3s token from control node
                        def k3sToken = sh(script: "ssh vagrant@${KUBE_MASTER} 'sudo cat /var/lib/rancher/k3s/server/node-token'", returnStdout: true).trim()

                        // Loop through worker nodes and install K3s if not installed
                        WORKER_NODES.split().each { node ->
                            def k3s_installed_worker = sh(script: "ssh vagrant@${node} 'which k3s'", returnStatus: true)
                            if (k3s_installed_worker != 0) {
                                echo "K3s is not installed on worker node ${node}, installing..."
                                sh """
                                ssh -tt vagrant@${node} -o StrictHostKeyChecking=no 'curl -sfL https://get.k3s.io | K3S_URL=https://${KUBE_MASTER}:6443 K3S_TOKEN=${k3sToken} sh -'
                                """
                            } else {
                                echo "K3s is already installed on worker node ${node}."
                            }
                        }
                    }
                }
            }
        }

        stage('Deploy Application to Kubernetes') {
            steps {
                script {
                    sshagent(['ssh-key']) {
                        // Copy Kubernetes manifests to control node
                        sh """
                        scp -r kubernetes-manifests vagrant@${KUBE_MASTER}:~/manifests
                        """
                        // Apply the deployment and service
                        sh """
                        ssh -tt vagrant@${KUBE_MASTER} -o StrictHostKeyChecking=no 'sudo kubectl apply -f ~/manifests/deployment.yaml'
                        ssh -tt vagrant@${KUBE_MASTER} -o StrictHostKeyChecking=no 'sudo kubectl apply -f ~/manifests/service.yaml'
                        """
                    }
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                script {
                    sshagent(['ssh-key']) {
                        // Verify deployment status
                        sh """
                        ssh -tt vagrant@${KUBE_MASTER} -o StrictHostKeyChecking=no 'sudo kubectl get pods && sudo kubectl get services'
                        """
                    }
                }
            }
        }
    }
}

