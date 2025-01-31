class User < ApplicationRecord
  has_secure_password
  has_many :loading_lists
  validates :email, presence: true, uniqueness: true, length: { minimum: 5 }, format: { without: /\s/, message: "cannot contain spaces" }
  validates :first_name, presence: true, length: { minimum: 2 }
  validates :last_name, presence: true, length: { minimum: 2 }
  validates :password, presence: true, length: { minimum: 4, maximum: 16 }, format: { without: /\s/, message: "cannot contain spaces" }
end
