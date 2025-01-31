class User < ApplicationRecord
  has_secure_password
  has_many :loading_lists
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :first_name, presence: true, length: { minimum: 2 }
  validates :last_name, presence: true, length: { minimum: 2 }
  validates :role, presence: true, inclusion: { in: %w[pm loader] }
  validates :password, length: { minimum: 6 }, if: -> { new_record? || !password.nil? }
end
