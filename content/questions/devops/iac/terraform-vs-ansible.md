---
topic: devops/iac
difficulty: medium
type: short-answer
tags: [terraform, ansible, idempotency, interview-favourite]
source: starter-seed
---

## Question
What is the difference between Terraform and Ansible, and when would you use each?

## Answer
Terraform **provisions** infrastructure: what exists. Ansible **configures** it:
what runs on it.

Terraform is declarative. You describe the desired end state (a VPC, three EC2
instances, a load balancer) and it compares that with its state file to work out
what to create, change or destroy. Ansible is procedural automation. Playbooks
run tasks in order over SSH to install packages, write config files and restart
services.

Use Terraform to create and change cloud resources, and Ansible to configure
the servers those resources run. They are often used together.

## Key points
- provisioning vs configuration management
- Terraform state file tracks desired vs actual
- both should be idempotent
- typical flow: Terraform creates the EC2, Ansible installs Docker on it

## Explanation
Ansible can create cloud resources and Terraform can run provisioners, but each
is awkward outside its lane. Ansible has no state file, so removing a resource
from a playbook doesn't delete it; Terraform provisioners run once at creation
and aren't re-applied when configuration drifts.

## References
- https://developer.hashicorp.com/terraform/intro
- https://docs.ansible.com/ansible/latest/getting_started/introduction.html
