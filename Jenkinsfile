def imageTag = 'front_latest'
def productionBranch = 'master'
pipeline {
  agent any
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }
    stage('Build image') {
      steps {
            script {
              sh "docker-compose down"
            }
      }
    }
    stage('Publish and Deploy') {
      steps {
          script {
                sh "COMPOSE_HTTP_TIMEOUT=200 docker-compose up -d --build && docker system prune -f"
            }
      }
    }
  }
}
