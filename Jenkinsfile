pipeline {
    agent any
    
    environment {
        ACR_NAME = 'acrcicdxfob5tqvpdg3m'
        ACR_LOGIN_SERVER = "${ACR_NAME}.azurecr.io"
        BACKEND_IMAGE = 'backend'
        FRONTEND_IMAGE = 'frontend'
        BUILD_NUMBER = "${env.BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out code from GitHub...'
                checkout scm
            }
        }
        
        stage('SonarQube Analysis') {
    steps {
        echo 'Running SonarQube analysis...'
        script {
            def scannerHome = tool 'SonarScanner'
            withSonarQubeEnv('SonarQube') {                // this injects SONAR_HOST_URL and SONAR_AUTH_TOKEN automatically
                sh """
                ${scannerHome}/bin/sonar-scanner \
                  -Dsonar.projectKey=cicd-demo-app \
                  -Dsonar.projectName="CI/CD Demo Application" \
                  -Dsonar.projectVersion=${BUILD_NUMBER} \
                  -Dsonar.sources=backend,frontend
            """
            }

            // Optional but very recommended: fail the pipeline if Quality Gate is red
            timeout(time: 5, unit: 'MINUTES') {
                def qg = waitForQualityGate()
                if (qg.status != 'OK') {
                    error "Pipeline aborted due to quality gate failure: ${qg.status}"
                }
            }
        }
    }
}
        
        stage('Build Docker Images') {
            parallel {
                stage('Build Backend') {
                    steps {
                        echo '🔨 Building backend image...'
                        dir('backend') {
                            sh """
                                docker build -t ${ACR_LOGIN_SERVER}/${BACKEND_IMAGE}:${BUILD_NUMBER} .
                                docker tag ${ACR_LOGIN_SERVER}/${BACKEND_IMAGE}:${BUILD_NUMBER} ${ACR_LOGIN_SERVER}/${BACKEND_IMAGE}:latest
                            """
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        echo '🔨 Building frontend image...'
                        dir('frontend') {
                            sh """
                                docker build -t ${ACR_LOGIN_SERVER}/${FRONTEND_IMAGE}:${BUILD_NUMBER} .
                                docker tag ${ACR_LOGIN_SERVER}/${FRONTEND_IMAGE}:${BUILD_NUMBER} ${ACR_LOGIN_SERVER}/${FRONTEND_IMAGE}:latest
                            """
                        }
                    }
                }
            }
        }
        
        stage('Push to ACR') {
            steps {
                echo '📤 Pushing images to Azure Container Registry...'
                script {
                    withCredentials([usernamePassword(credentialsId: 'acr-credentials', usernameVariable: 'ACR_USER', passwordVariable: 'ACR_PASS')]) {
                        sh """
                            echo ${ACR_PASS} | docker login ${ACR_LOGIN_SERVER} -u ${ACR_USER} --password-stdin
                            
                            docker push ${ACR_LOGIN_SERVER}/${BACKEND_IMAGE}:${BUILD_NUMBER}
                            docker push ${ACR_LOGIN_SERVER}/${BACKEND_IMAGE}:latest
                            
                            docker push ${ACR_LOGIN_SERVER}/${FRONTEND_IMAGE}:${BUILD_NUMBER}
                            docker push ${ACR_LOGIN_SERVER}/${FRONTEND_IMAGE}:latest
                        """
                    }
                }
            }
        }
        
        stage('Deploy to AKS') {
            steps {
                echo '☸️ Deploying to Kubernetes...'
                script {
                    withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                        sh """
                            export KUBECONFIG=\${KUBECONFIG}
                            
                            # Deploy backend
                            kubectl apply -f k8s/backend-deployment.yaml
                            kubectl set image deployment/backend-deployment backend=${ACR_LOGIN_SERVER}/${BACKEND_IMAGE}:${BUILD_NUMBER}
                            
                            # Deploy frontend
                            kubectl apply -f k8s/frontend-deployment.yaml
                            kubectl set image deployment/frontend-deployment frontend=${ACR_LOGIN_SERVER}/${FRONTEND_IMAGE}:${BUILD_NUMBER}
                            
                            # Wait for rollout
                            kubectl rollout status deployment/backend-deployment
                            kubectl rollout status deployment/frontend-deployment
                        """
                    }
                }
            }
        }
        
        stage('Get Service URLs') {
            steps {
                echo '🌐 Getting service external IPs...'
                script {
                    withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                        sh """
                            export KUBECONFIG=\${KUBECONFIG}
                            echo "Backend Service:"
                            kubectl get svc backend-service
                            echo "Frontend Service:"
                            kubectl get svc frontend-service
                        """
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline completed successfully!'
            echo '🎉 Application deployed to AKS'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
        always {
            echo '🧹 Cleaning up Docker images...'
            sh 'docker system prune -f || true'
        }
    }
}
